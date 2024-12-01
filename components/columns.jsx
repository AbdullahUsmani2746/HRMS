import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor('businessName', { header: 'Business Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('city', { header: 'City' }),
  columnHelper.accessor('country', { header: 'Country' }),
  columnHelper.accessor(
    row => `${row.cpFirstName} ${row.cpSurname}`, 
    { id: 'contactPerson', header: 'Contact Person' }
  ),
  columnHelper.accessor('cpPhoneNumber', { header: 'Phone Number' }),
  columnHelper.accessor('status', { header: 'Status' }),
];
