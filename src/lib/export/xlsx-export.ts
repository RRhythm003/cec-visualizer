import { Proposal, Meeting } from "@/types";

export async function exportToXLSX(meeting: Meeting, proposals: Proposal[]): Promise<void> {
  // Dynamically import xlsx to avoid SSR issues
  const XLSX = await import("xlsx");

  const rows = proposals.map((p) => ({
    "Proposal Code": p.proposal_code,
    "Serial No.": p.serial_number,
    "AG Code": p.ag_code ?? "",
    "Client Name": p.client_name,
    "Group Name": p.group_name ?? "",
    Division: p.division,
    Category: p.category,
    "Facility Type": p.facility_type ?? "",
    "Existing Exposure (Cr)": p.existing_exposure ?? "",
    "Proposed Amount (Cr)": p.proposed_amount ?? "",
    "Cumulative Exposure (Cr)": p.cumulative_exposure ?? "",
    "Interest Rate (%)": p.interest_rate ?? "",
    Tenor: p.tenor ?? "",
    "IRG Grade": p.irg_grade ?? "",
    "CIB Status": p.cib_status ?? "",
    "DSCR": p.dscr ?? "",
    "D:E Ratio": p.de_ratio ?? "",
    "Disbursed Amount (Cr)": p.disbursed_amount ?? "",
    "Current Outstanding (Cr)": p.current_outstanding ?? "",
    "Settlement Amount (Cr)": p.settlement_amount ?? "",
    "Waiver Amount (Cr)": p.waiver_amount ?? "",
    "Months of Default": p.months_of_default ?? "",
    Resolution: p.resolution,
    "Resolution Notes": p.resolution_note ?? "",
    "Resolution Timestamp": p.resolution_timestamp
      ? new Date(p.resolution_timestamp).toLocaleString("en-GB")
      : "",
    "Action Owners": p.action_owners.map((ao) => ao.name).join(", "),
    "Action Deadline": p.action_deadline
      ? new Date(p.action_deadline).toLocaleDateString("en-GB")
      : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Proposals");

  // Summary sheet
  const summaryRows = [
    ["CEC Meeting", meeting.meeting_code],
    ["Title", meeting.title],
    ["Date", new Date(meeting.date).toLocaleDateString("en-GB")],
    ["Total Proposals", meeting.summary.total],
    ["Approved", meeting.summary.approved],
    ["Board Approval Pending", meeting.summary.board_pending],
    ["Deferred", meeting.summary.deferred],
    ["Declined", meeting.summary.declined],
    ["Corporate", meeting.summary.corporate],
    ["SME Banking", meeting.summary.sme],
    ["Consumer Asset", meeting.summary.consumer],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  XLSX.writeFile(wb, `${meeting.meeting_code}_Minutes.xlsx`);
}
