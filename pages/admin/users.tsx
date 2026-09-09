import MemberLayout from "../../components/MemberLayout"

/* Admin — Users (port of AdminUsers.dc.html) */

const USERS = [
  { name: "Sarah Chen", email: "sarah@example.com", role: "Admin", active: true, joined: "3 months ago", last: "2 hours ago" },
  { name: "James Rivera", email: "james@example.com", role: "Moderator", active: true, joined: "2 months ago", last: "12 hours ago" },
  { name: "Alex Thompson", email: "alex@example.com", role: "Member", active: true, joined: "1 week ago", last: "2 days ago" },
  { name: "Morgan Lee", email: "morgan@example.com", role: "Member", active: false, joined: "3 weeks ago", last: "2 weeks ago" },
]

export default function AdminUsers() {
  return (
    <MemberLayout title="SUPERCOMPUTE · User Management" variant="admin" wide>
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>User Management</h1>
          </div>
        </div>

        <div className="filter-bar">
          <input className="filter-input" type="text" placeholder="Search by name or email..." />
          <select className="filter-select" defaultValue="All Roles">
            <option>All Roles</option><option>Admin</option><option>Moderator</option><option>Member</option><option>Banned</option>
          </select>
          <select className="filter-select" defaultValue="All Status">
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        <table className="users-table term-card">
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Last Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.email}>
                <td>
                  <div className="user-name">{u.name}</div>
                  <div className="user-email">{u.email}</div>
                </td>
                <td><div className="role-badge">{u.role}</div></td>
                <td><span className={u.active ? "status-active" : "status-inactive"}>{u.active ? "Active" : "Inactive"}</span></td>
                <td>{u.joined}</td>
                <td>{u.last}</td>
                <td>
                  <div className="action-menu">
                    <button className="row-btn">Edit</button>
                    <button className="row-btn">Ban</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MemberLayout>
  )
}
