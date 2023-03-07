import { Item } from "../models/Item";

export const tableColumns = [
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: Item) => `${element.name}`,
  },
  {
    columnDef: 'quantity',
    header: 'Quantity',
    cell: (element: Item) => `${element.quantity}`,
  },
  {
    columnDef: 'edit',
    header: '',
    cell: '',
  },
  {
    columnDef: 'delete',
    header: '',
    cell: '',
  },
];