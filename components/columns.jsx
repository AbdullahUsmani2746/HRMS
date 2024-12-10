import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor('businessName', { header: 'Name', id: 'businessName', isVisible: true }),
  columnHelper.accessor('email', { header: 'Email', id: 'email', isVisible: true }),
  columnHelper.accessor('city', { header: 'City', id: 'city', isVisible: false }),
  columnHelper.accessor('country', { header: 'Country', id: 'country', isVisible: false }),
  columnHelper.accessor(
    row => `${row.cpFirstName} ${row.cpSurname}`,
    { header: 'Contact Person', id: 'contactPerson', isVisible: true }
  ),
  columnHelper.accessor('cpPhoneNumber', { header: 'Phone Number', id: 'cpPhoneNumber', isVisible: false }),
  columnHelper.accessor('status', { header: 'Status', id: 'status', isVisible: true }),
  

];

