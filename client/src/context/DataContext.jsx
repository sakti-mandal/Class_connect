import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCourses,
  todayTimetable,
  initialAnnouncements,
  initialAssignments,
  initialResources,
  initialDiscussions,
  initialAttendance,
  initialPeers,
  initialTeams,
  initialCalendarEvents,
  initialAdminStats,
  initialSyllabus,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const { addToast } = useNotification();

  // Helper for localStorage state
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`classconnect_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  // State slices
  const [courses, setCourses] = useState(() => loadState('courses', initialCourses));
  const [timetable, setTimetable] = useState(() => loadState('timetable', todayTimetable));
  const [announcements, setAnnouncements] = useState(() => loadState('announcements', initialAnnouncements));
  const [assignments, setAssignments] = useState(() => loadState('assignments', initialAssignments));
  const [resources, setResources] = useState(() => loadState('resources', initialResources));
  const [discussions, setDiscussions] = useState(() => loadState('discussions', initialDiscussions));
  const [attendance, setAttendance] = useState(() => loadState('attendance', initialAttendance));
  const [syllabus, setSyllabus] = useState(() => loadState('syllabus', initialSyllabus));
  const [peers, setPeers] = useState(() => loadState('peers', initialPeers));
  const [teams, setTeams] = useState(() => loadState('teams', initialTeams));
  const [calendarEvents, setCalendarEvents] = useState(() => loadState('calendarEvents', initialCalendarEvents));
  const [adminStats, setAdminStats] = useState(() => loadState('adminStats', initialAdminStats));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('classconnect_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('classconnect_timetable', JSON.stringify(timetable));
  }, [timetable]);
  useEffect(() => {
    localStorage.setItem('classconnect_announcements', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('classconnect_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('classconnect_resources', JSON.stringify(resources));
  }, [resources]);
  useEffect(() => {
    localStorage.setItem('classconnect_discussions', JSON.stringify(discussions));
  }, [discussions]);
  useEffect(() => {
    localStorage.setItem('classconnect_attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('classconnect_syllabus', JSON.stringify(syllabus));
  }, [syllabus]);
  useEffect(() => {
    localStorage.setItem('classconnect_peers', JSON.stringify(peers));
  }, [peers]);
  useEffect(() => {
    localStorage.setItem('classconnect_teams', JSON.stringify(teams));
  }, [teams]);
  useEffect(() => {
    localStorage.setItem('classconnect_calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // ==================== ASSIGNMENT ACTIONS ====================
  const submitAssignment = (assignmentId, fileData, comment = '') => {
    setAssignments(prev =>
      prev.map(item => {
        if (item.id === assignmentId) {
          return {
            ...item,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            submittedFile: fileData?.name || 'Assignment_Submission.pdf',
            studentComment: comment,
          };
        }
        return item;
      })
    );
    addToast('Assignment successfully submitted!', 'success');
  };

  const createAssignment = newAsg => {
    const item = {
      id: 'asg-' + Date.now(),
      status: 'pending',
      faculty: currentUser?.name || 'Faculty Member',
      facultyId: currentUser?.id || 'fac-default',
      attachments: [],
      ...newAsg,
    };
    setAssignments(prev => [item, ...prev]);
    addToast('New assignment published successfully.', 'success');
  };

  const gradeAssignment = (assignmentId, grade, feedback) => {
    setAssignments(prev =>
      prev.map(item => {
        if (item.id === assignmentId) {
          return {
            ...item,
            status: 'graded',
            grade: Number(grade),
            feedback,
          };
        }
        return item;
      })
    );
    addToast('Student submission graded & feedback sent.', 'success');
  };

  // ==================== DISCUSSION ACTIONS ====================
  const addDiscussion = (title, content, subject, tags = []) => {
    const newPost = {
      id: 'disc-' + Date.now(),
      title,
      subject,
      code: courses.find(c => c.name === subject)?.code || 'GEN101',
      author: currentUser?.name || 'Anonymous Student',
      authorRole: currentUser?.role || 'student',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timestamp: 'Just now',
      content,
      tags: tags.length ? tags : ['General'],
      upvotes: 0,
      hasUpvoted: false,
      replies: [],
    };
    setDiscussions(prev => [newPost, ...prev]);
    addToast('Discussion thread created!', 'success');
  };

  const addReply = (discussionId, content) => {
    const newReply = {
      id: 'rep-' + Date.now(),
      author: currentUser?.name || 'Class Participant',
      authorRole: currentUser?.role || 'student',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timestamp: 'Just now',
      content,
      isAccepted: false,
      upvotes: 0,
    };

    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          return {
            ...d,
            replies: [...d.replies, newReply],
          };
        }
        return d;
      })
    );
    addToast('Reply posted successfully.', 'success');
  };

  const toggleUpvote = discussionId => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const hasUpvoted = !d.hasUpvoted;
          return {
            ...d,
            hasUpvoted,
            upvotes: hasUpvoted ? d.upvotes + 1 : Math.max(0, d.upvotes - 1),
          };
        }
        return d;
      })
    );
  };

  const toggleAcceptedAnswer = (discussionId, replyId) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          return {
            ...d,
            replies: d.replies.map(r => ({
              ...r,
              isAccepted: r.id === replyId ? !r.isAccepted : false,
            })),
          };
        }
        return d;
      })
    );
    addToast('Accepted answer status updated.', 'info');
  };

  // ==================== RESOURCE ACTIONS ====================
  const addResource = resourceData => {
    const newRes = {
      id: 'res-' + Date.now(),
      uploader: currentUser?.name || 'Contributor',
      uploaderRole: currentUser?.role === 'faculty' ? 'Faculty' : 'Student',
      downloadCount: 0,
      date: 'Just now',
      format: 'pdf',
      ...resourceData,
    };
    setResources(prev => [newRes, ...prev]);
    addToast('Resource successfully added to Hub.', 'success');
  };

  const incrementDownload = resourceId => {
    setResources(prev =>
      prev.map(r => (r.id === resourceId ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );
  };

  // ==================== ANNOUNCEMENT ACTIONS ====================
  const addAnnouncement = announcementData => {
    const newAnn = {
      id: 'ann-' + Date.now(),
      author: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'admin',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      pinned: false,
      ...announcementData,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addToast('Announcement broadcasted to campus.', 'success');
  };

  const togglePinAnnouncement = id => {
    setAnnouncements(prev =>
      prev.map(a => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  const deleteAnnouncement = id => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addToast('Announcement removed.', 'info');
  };

  // ==================== TEAM FINDER ACTIONS ====================
  const createTeam = teamData => {
    const newTeam = {
      id: 'team-' + Date.now(),
      leader: currentUser?.name || 'Team Lead',
      leaderId: currentUser?.id || 'lead-id',
      members: [
        {
          name: currentUser?.name || 'Team Lead',
          role: 'Team Creator',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
      ],
      status: 'Recruiting',
      ...teamData,
    };
    setTeams(prev => [newTeam, ...prev]);
    addToast(`Team "${teamData.name}" created!`, 'success');
  };

  const joinTeam = (teamId, student) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          const alreadyIn = t.members.some(m => m.name === student.name);
          if (alreadyIn) return t;
          return {
            ...t,
            members: [
              ...t.members,
              {
                name: student.name,
                role: student.role || 'Contributor',
                avatar: student.avatar,
              },
            ],
            openSlots: Math.max(0, t.openSlots - 1),
            status: t.openSlots <= 1 ? 'Full' : 'Recruiting',
          };
        }
        return t;
      })
    );
    addToast('Successfully joined the team!', 'success');
  };

  // ==================== ATTENDANCE ACTIONS ====================
  const markAttendance = (code, present = true) => {
    setAttendance(prev =>
      prev.map(a => {
        if (a.code === code) {
          const attended = present ? a.attended + 1 : a.attended;
          const total = a.total + 1;
          const percentage = Number(((attended / total) * 100).toFixed(1));
          return {
            ...a,
            attended,
            total,
            percentage,
            status: percentage >= 85 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Warning',
          };
        }
        return a;
      })
    );
    addToast(`Attendance recorded for ${code}`, 'success');
  };

  // ==================== SYLLABUS TRACKER ACTIONS ====================
  const updateModuleStatus = (courseId, moduleId, newStatus) => {
    setSyllabus(prev =>
      prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedModules = c.modules.map(m =>
          m.id === moduleId ? { ...m, status: newStatus } : m
        );
        // Calculate new course status
        const completedCount = updatedModules.filter(m => m.status === 'Completed').length;
        const courseStatus =
          completedCount === updatedModules.length
            ? 'Completed'
            : completedCount > 0
            ? 'On Track'
            : 'In Progress';
        return { ...c, modules: updatedModules, status: courseStatus };
      })
    );
    addToast(`Module status updated to ${newStatus}`, 'success');
  };

  const toggleTopicRevision = (courseId, moduleId, topicName) => {
    setSyllabus(prev =>
      prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedModules = c.modules.map(m => {
          if (m.id !== moduleId) return m;
          const updatedTopics = m.topics.map(t =>
            t.name === topicName ? { ...t, selfRevised: !t.selfRevised } : t
          );
          return { ...m, topics: updatedTopics };
        });
        return { ...c, modules: updatedModules };
      })
    );
  };

  const logCompletedLecture = (courseId, topicCovered = '') => {
    setSyllabus(prev =>
      prev.map(c => {
        if (c.id !== courseId) return c;
        const newCompleted = Math.min(c.totalLectures, c.completedLectures + 1);
        const progressPct = ((newCompleted / c.totalLectures) * 100);
        const status = progressPct >= 70 ? 'On Track' : progressPct >= 40 ? 'In Progress' : 'Needs Attention';
        return {
          ...c,
          completedLectures: newCompleted,
          status,
          lastDeliveredTopic: topicCovered || c.lastDeliveredTopic,
        };
      })
    );
    addToast(`Lecture logged for ${courseId}. Syllabus progress updated!`, 'success');
  };

  const addSyllabusCourse = (newCourse) => {
    const courseObj = {
      id: newCourse.code.toUpperCase().replace(/\s+/g, ''),
      code: newCourse.code.toUpperCase(),
      name: newCourse.name,
      department: newCourse.department || 'Computer Science & Engineering',
      faculty: newCourse.faculty || 'Faculty Instructor',
      semester: newCourse.semester || 'Semester 6',
      credits: Number(newCourse.credits) || 3,
      totalLectures: Number(newCourse.totalLectures) || 30,
      completedLectures: 0,
      targetCompletion: newCourse.targetCompletion || 'Dec 2026',
      status: 'In Progress',
      modules: newCourse.modules || [
        {
          id: 'mod-1',
          number: 1,
          title: 'Core Fundamentals & Introduction',
          lectures: 6,
          status: 'In Progress',
          topics: [
            { name: 'Introduction and Scope', done: true, selfRevised: false },
            { name: 'Foundational Principles', done: false, selfRevised: false },
          ],
        },
      ],
    };
    setSyllabus(prev => [courseObj, ...prev]);
    addToast(`Course ${courseObj.code} added to official syllabus!`, 'success');
  };

  const addModuleToCourse = (courseId, moduleTitle, lectures = 6) => {
    setSyllabus(prev =>
      prev.map(c => {
        if (c.id !== courseId) return c;
        const newMod = {
          id: `mod-${Date.now()}`,
          number: c.modules.length + 1,
          title: moduleTitle,
          lectures: Number(lectures) || 6,
          status: 'Upcoming',
          topics: [
            { name: `${moduleTitle}: Topic 1`, done: false, selfRevised: false },
            { name: `${moduleTitle}: Topic 2`, done: false, selfRevised: false },
          ],
        };
        return {
          ...c,
          modules: [...c.modules, newMod],
          totalLectures: c.totalLectures + (Number(lectures) || 6),
        };
      })
    );
    addToast(`New module added to ${courseId} syllabus.`, 'success');
  };

  // ==================== CALENDAR ACTIONS ====================
  const addCalendarEvent = eventData => {
    const newEvt = {
      id: 'evt-' + Date.now(),
      ...eventData,
    };
    setCalendarEvents(prev => [...prev, newEvt]);
    addToast('Event added to academic calendar.', 'success');
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        timetable,
        announcements,
        assignments,
        resources,
        discussions,
        attendance,
        syllabus,
        peers,
        teams,
        calendarEvents,
        adminStats,
        submitAssignment,
        createAssignment,
        gradeAssignment,
        addDiscussion,
        addReply,
        toggleUpvote,
        toggleAcceptedAnswer,
        addResource,
        incrementDownload,
        addAnnouncement,
        togglePinAnnouncement,
        deleteAnnouncement,
        createTeam,
        joinTeam,
        markAttendance,
        updateModuleStatus,
        toggleTopicRevision,
        logCompletedLecture,
        addSyllabusCourse,
        addModuleToCourse,
        addCalendarEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

