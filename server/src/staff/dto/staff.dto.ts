export class StaffResponseDto {
  id: number;
  staffId: number | null;
  status: 'Active' | 'Inactive';
  performance: 'High' | 'Medium' | 'Low';
  assignedLeads: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | 'N/A';
  };
}
