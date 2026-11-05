import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function SmartTeamFinder() {
  const { peers, teams, createTeam, joinTeam } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useNotification();

  const [activeView, setActiveView] = useState('peers');
  const [skillFilter, setSkillFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamTagline, setTeamTagline] = useState('');
  const [projectType, setProjectType] = useState('ClassConnect Hackathon 2026');
  const [neededRolesInput, setNeededRolesInput] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const allSkills = ['All', 'React.js', 'PyTorch', 'Python', 'Figma', 'Go', 'Flutter', 'Solidity'];

  const filteredPeers = peers.filter(peer => {
    const matchesSkill = skillFilter === 'All' || peer.skills.includes(skillFilter);
    const matchesSearch =
      peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSkill && matchesSearch;
  });

  const handleCreateTeamSubmit = e => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const neededRoles = neededRolesInput
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);

    createTeam({
      name: teamName,
      tagline: teamTagline,
      projectType,
      neededRoles: neededRoles.length ? neededRoles : ['Full Stack Contributor'],
      openSlots: neededRoles.length || 2,
      tags: ['Innovation'],
      description: teamDescription,
    });

    confetti({ particleCount: 70, spread: 60 });
    setIsCreatingTeam(false);
    setTeamName('');
    setTeamTagline('');
    setNeededRolesInput('');
    setTeamDescription('');
    setActiveView('teams');
  };

  const handleSendInvite = peer => {
    addToast(`Invite sent to ${peer.name}!`, 'success');
  };

  const handleJoinTeam = team => {
    joinTeam(team.id, {
      name: currentUser?.name || 'Class Participant',
      role: 'Core Contributor',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    confetti({ particleCount: 60, spread: 50 });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Team Finder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find project teammates based on complementary skills and view recruitment boards.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTeam(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Project</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveView('peers')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeView === 'peers'
              ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Find Teammates ({filteredPeers.length})
        </button>

        <button
          onClick={() => setActiveView('teams')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeView === 'teams'
              ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Project Teams ({teams.length})
        </button>
      </div>

      {/* VIEW 1: PEERS */}
      {activeView === 'peers' && (
        <div className="space-y-4">
          {/* Filter row */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or skill..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {allSkills.map(s => (
                <button
                  key={s}
                  onClick={() => setSkillFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    skillFilter === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Peers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeers.map(peer => (
              <div
                key={peer.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={peer.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {peer.name}
                        </h3>
                        <p className="text-[11px] text-brand-600 font-medium">{peer.role}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      {peer.compatibility}% match
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                    Seeking: {peer.lookingFor}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {peer.skills.map(sk => (
                      <span
                        key={sk}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className={`text-[11px] ${peer.available ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {peer.available ? '● Available' : '● In a Team'}
                  </span>

                  <button
                    onClick={() => handleSendInvite(peer)}
                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PROJECT TEAMS */}
      {activeView === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => {
            const isUserMember = team.members.some(m => m.name === currentUser?.name);

            return (
              <div
                key={team.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-brand-600">{team.projectType}</span>
                    <span className="text-slate-400">
                      {team.openSlots > 0 ? `${team.openSlots} open slots` : 'Full'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic mt-0.5">"{team.tagline}"</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {team.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {team.neededRoles.map(role => (
                      <span
                        key={role}
                        className="text-[11px] px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium"
                      >
                        Role: {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Lead: {team.leader}</span>

                  {isUserMember ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                    </span>
                  ) : team.openSlots > 0 ? (
                    <button
                      onClick={() => handleJoinTeam(team)}
                      className="px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition"
                    >
                      Join Team
                    </button>
                  ) : (
                    <span className="text-slate-400">Squad Full</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Project Modal */}
      {isCreatingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTeamSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Post Project Team
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingTeam(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Team / Project Name *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. EcoSphere IoT"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Tagline *
              </label>
              <input
                type="text"
                required
                value={teamTagline}
                onChange={e => setTeamTagline(e.target.value)}
                placeholder="e.g. Smart campus energy monitoring"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Roles Needed (comma-separated)
              </label>
              <input
                type="text"
                value={neededRolesInput}
                onChange={e => setNeededRolesInput(e.target.value)}
                placeholder="Backend Dev, UI Designer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={teamDescription}
                onChange={e => setTeamDescription(e.target.value)}
                placeholder="Project goals and stack..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingTeam(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-medium text-xs"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
