// Leadership and Admin can edit every department's KPIs and SOPs.
// A department head can only edit their own department.
// Everyone (any authenticated session) can view all departments read-only.
export function canEditDepartment(session, departmentKey) {
  if (!session) return false;
  if (session.role === "ADMIN" || session.role === "LEADERSHIP") return true;
  return session.role === "DEPT_HEAD" && session.departmentKey === departmentKey;
}
