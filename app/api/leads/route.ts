import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createContact, createOpportunity, findOpportunityByContact } from "@/lib/ghl";
import { USER_EMAIL_TO_GHL_ID } from "@/lib/userMap";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userEmail = session.user?.email;

  const assignedTo =
  userEmail &&
  userEmail in USER_EMAIL_TO_GHL_ID
    ? USER_EMAIL_TO_GHL_ID[userEmail as keyof typeof USER_EMAIL_TO_GHL_ID]
    : undefined;
    
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      value = 0,
      stageId,
      stage, // ✅ NEW SUPPORT
      tags = [],
      pipelineId,
      account = "BCF",
    } = body;

    const finalStageId = stageId || stage; // ✅ FIX

    // ✅ VALIDATION
    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    if (!pipelineId) {
      return NextResponse.json(
        { error: "pipelineId is required" },
        { status: 400 }
      );
    }

    if (!finalStageId) {
      return NextResponse.json(
        { error: "stage is required" },
        { status: 400 }
      );
    }

    // ✅ CREATE / REUSE CONTACT
    let contactId: string;

    try {
      const contact = await createContact({
        name,
        email,
        phone,
        tags,
      }, account
    );

      contactId = contact.id;

    } catch (err: any) {
      const message = err.message || "";

      if (message.includes("duplicated contacts")) {
        console.log("⚠️ Duplicate contact detected");

        try {
          const parsed = JSON.parse(message.replace(/^.*?: /, ""));
          contactId = parsed.meta?.contactId;
        } catch {
          throw new Error("Duplicate contact but parsing failed");
        }

        if (!contactId) {
          throw new Error("Duplicate contact but no contactId returned");
        }
      } else {
        throw err;
      }
    }

    // ✅ CREATE OPPORTUNITY
    let opp;

try {
  console.log("CREATE OPP DEBUG:", {
  account,
  pipelineId,
  stageId: finalStageId,
});
  opp = await createOpportunity(
    {
      contactId,
      name,
      stageId: finalStageId,
      value,
      pipelineId,
      assignedTo,
    },
    account
  );
} catch (err: any) {
  if (err.message.includes("duplicate")) {
    console.log("⚠️ Duplicate opportunity detected");

    // 🔍 CHECK if opportunity actually exists
    const existing = await findOpportunityByContact(
      contactId,
      pipelineId,
      account
    );

    if (existing) {
      console.log("✅ Found existing opportunity");
      opp = { id: existing.id };

    } else {
      console.log("⚠️ No opportunity found — creating again");

      // 🔁 RETRY create (THIS FIXES BGR ISSUE)
      opp = await createOpportunity(
        {
          contactId,
          name,
          stageId: finalStageId,
          value,
          pipelineId,
          assignedTo,
        },
        account
      );
    }

  } else {
    throw err;
  }
}

    // ✅ RETURN FULL LEAD (for UI)
    return NextResponse.json(
      {
        success: true,
        lead: {
          id: opp.id,
          name,
          email,
          phone,
          stage: finalStageId,
          value,
          assignedTo: "You",
        },
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("CREATE LEAD ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}