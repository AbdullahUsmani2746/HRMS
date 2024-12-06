import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor('businessName', { header: 'Business Name', id: 'businessName', isVisible: true }),
  columnHelper.accessor('email', { header: 'Email', id: 'email', isVisible: true }),
  columnHelper.accessor('city', { header: 'City', id: 'city', isVisible: true }),
  columnHelper.accessor('country', { header: 'Country', id: 'country', isVisible: true }),
  columnHelper.accessor(
    row => `${row.cpFirstName} ${row.cpSurname}`,
    { header: 'Contact Person', id: 'contactPerson', isVisible: true }
  ),
  columnHelper.accessor('cpPhoneNumber', { header: 'Phone Number', id: 'cpPhoneNumber', isVisible: true }),
  columnHelper.accessor('status', { header: 'Status', id: 'status', isVisible: true }),
  columnHelper.accessor('actions', { header: 'Actions', id: 'actions', isVisible: true }),
];
