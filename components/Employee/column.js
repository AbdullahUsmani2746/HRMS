import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const columns_employee = [
  columnHelper.accessor("name", { header: "Name", id: "firstName", isVisible: true }),
  columnHelper.accessor("email", { header: "Email", id: "emailAddress", isVisible: true }),
  columnHelper.accessor("phone", { header: "Phone", id: "phoneNumber", isVisible: true }),
  columnHelper.accessor("department", { header: "Department", id: "department", isVisible: false }),
  columnHelper.accessor("designation", { header: "Designation", id: "jobTitle", isVisible: true }),
  columnHelper.accessor("status", { header: "Status", id: "status", isVisible: true }),
  columnHelper.accessor("allownces", { header: "Allownce", id: "allownces", isVisible: true }),
  columnHelper.accessor("deductions", { header: "Deduction", id: "deductions", isVisible: true }),

];
