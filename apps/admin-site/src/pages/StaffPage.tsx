import React, { useState } from 'react';
import { Shield, Plus, Key, User, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { StaffUser, ActivityLog, cafeStore } from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

interface StaffPageProps {
  currentStaff: StaffUser;
}

export const StaffPage: React.FC<StaffPageProps> = ({ currentStaff }) => {
  const [staffList, setStaffList] = useState<StaffUser[]>(() => cafeStore.getStaff());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => cafeStore.getActivityLog());
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'manager' | 'staff'>('staff');
  const [pin, setPin] = useState('5566');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    cafeStore.addStaffUser({
      name: name.trim(),
      email: email.trim(),
      role,
      pin: pin.trim(),
      avatarLetter: name.trim().charAt(0).toUpperCase(),
    });

    setStaffList([...cafeStore.getStaff()]);
    setActivityLogs([...cafeStore.getActivityLog()]);
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Owner Sovereignty & RBAC
          </span>
          <h2 className="font-serif-display text-2xl font-bold text-[#2B1B14] mt-0.5">
            Staff Accounts & Security Audit
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] font-serif-display text-xs font-semibold hover:bg-[#3d281f] cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#E5B358]" />
          <span>Provision Staff Member</span>
        </button>
      </div>

      {/* Staff Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staffList.map((member) => (
          <div
            key={member.id}
            className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#C65D3B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {member.avatarLetter}
                </div>
                <div>
                  <h3 className="font-serif-display text-base font-bold text-[#2B1B14]">
                    {member.name}
                  </h3>
                  <span className="text-[11px] text-[#4A372F]">{member.email}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  member.role === 'owner'
                    ? 'bg-[#C65D3B] text-white'
                    : member.role === 'manager'
                    ? 'bg-[#2B1B14] text-[#FAF5EC]'
                    : 'bg-[#FAF5EC] text-[#2B1B14] border border-[#B98A5E]/60'
                }`}
              >
                {member.role}
              </span>
            </div>

            <div className="pt-2 border-t border-dashed border-[#B98A5E]/40 flex items-center justify-between text-xs text-[#4A372F]">
              <span className="flex items-center gap-1 font-mono">
                <Key className="w-3.5 h-3.5 text-[#B98A5E]" />
                <span>Station PIN: {member.pin || 'None'}</span>
              </span>
              <span className="text-[10px] text-[#2E7D32] font-semibold">Active Account</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log Trail */}
      <div className="paper-sheet paper-grain border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#B98A5E]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B98A5E]" />
            <h3 className="font-serif-display text-base font-bold text-[#2B1B14]">
              System Activity Audit Trail
            </h3>
          </div>
          <span className="text-xs text-[#4A372F] font-mono">Chronological Ledger</span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E7D6BE] text-[#2B1B14] font-serif-display font-semibold border-b border-[#B98A5E]/40 sticky top-0">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Staff Operator</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/30 bg-[#FAF5EC]">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4EBDD]/50 transition-colors">
                  <td className="p-3 font-mono text-[#4A372F]">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-[#2B1B14]">
                    {log.staffName}{' '}
                    <span className="text-[10px] text-[#C65D3B] font-mono">({log.staffRole})</span>
                  </td>
                  <td className="p-3 font-mono font-medium text-[#2B1B14]">{log.action}</td>
                  <td className="p-3 text-[#4A372F]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md paper-sheet paper-grain p-6 border border-[#B98A5E]/50 shadow-2xl space-y-4">
            <WashiTape variant="terracotta" position="top-center" label="Staff Account Slip" />

            <div className="flex items-center justify-between border-b border-[#B98A5E]/40 pb-3 pt-2">
              <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
                Provision Staff Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#4A372F] hover:text-[#2B1B14]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2B1B14] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Kulkarni"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1B14] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="liam@ateliervelin.coffee"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2B1B14] mb-1">Role Clearance</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    <option value="staff">Staff / Kitchen</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1B14] mb-1">Counter PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-[#B98A5E]/40 text-[#4A372F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2B1B14] text-[#FAF5EC] font-serif-display font-semibold hover:bg-[#3d281f]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
