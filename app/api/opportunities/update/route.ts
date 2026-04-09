import { NextResponse } from "next/server";
import { ACCOUNTS, type AccountType } from "@/lib/accounts";

export async function PUT(req: Request) {
  try {
    const {
      opportunityId,
      contactId,
      value,
      stageId,
      pipelineId,
      account,
      email,
      phone,
      name, // optional
    } = (await req.json()) as {
      opportunityId: string;
      contactId?: string;
      value?: number;
      stageId: string;
      pipelineId: string;
      account: AccountType;
      email?: string;
      phone?: string;
      name?: string;
    };

    if (!opportunityId || !stageId || !pipelineId || !account) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = opportunityId;

    console.log("🔥 FINAL UPDATE REQUEST:", {
      id,
      stageId,
      value,
      pipelineId,
      account,
    });

    // ✅ UPDATE OPPORTUNITY
    const res = await fetch(
      `https://services.leadconnectorhq.com/opportunities/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${ACCOUNTS[account].apiKey}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          // ✅ DO NOT FORCE NAME (only include if provided)
          ...(name ? { name } : {}),
          ...(value !== undefined
            ? { monetaryValue: Number(value) }
            : {}),
          pipelineId,
          pipelineStageId: stageId,
          status: "open",
        }),
      }
    );

    // ✅ SAFE RESPONSE HANDLING (NO DOUBLE READ)
    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    console.log("✅ GHL RESPONSE:", data);

    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: 500 }
      );
    }

    // ✅ UPDATE CONTACT (EMAIL / PHONE / NAME)
    if (contactId && (email || phone || name)) {
      const contactRes = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ACCOUNTS[account].apiKey}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
          body: JSON.stringify({
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
            ...(name ? { name } : {}),
          }),
        }
      );

      if (!contactRes.ok) {
        const txt = await contactRes.text();
        console.error("❌ CONTACT UPDATE ERROR:", txt);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ UPDATE ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}