import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Plus, Trash2, Search, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';
import type { Quiz, Classroom, QuizQuestion, QuizAttempt } from '@/types';
import toast from 'react-hot-toast';

interface NewQuestion {
  question: string;
  type: 'mcq' | 'true_false';
  options: string[];
  correctAnswer: string;
  marks: number;
}

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Quiz Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [questions, setQuestions] = useState<NewQuestion[]>([
    { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt Results Modal State
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, cRes] = await Promise.all([
        api.get<Quiz[]>('/quizzes'),
        api.get<Classroom[]>('/classrooms'),
      ]);
      if (qRes.success) setQuizzes(qRes.data);
      if (cRes.success) setClassrooms(cRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 }
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return toast.error('Quiz must have at least one question');
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof NewQuestion, val: unknown) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'type' && val === 'true_false') {
      updated[idx].options = ['True', 'False'];
      updated[idx].correctAnswer = 'True';
    }
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = val;
    setQuestions(updated);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classroomId) {
      return toast.error('Quiz Title and Classroom are required');
    }
    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return toast.error(`Question ${i + 1} text cannot be empty`);
      if (!q.correctAnswer) return toast.error(`Please select correct answer for Question ${i + 1}`);
    }

    setIsSubmitting(true);
    try {
      const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);
      const res = await api.post<Quiz>('/quizzes', {
        title,
        classroomId,
        description,
        duration: Number(duration),
        totalMarks,
        questions,
      });

      if (res.success) {
        toast.success(`Quiz "${title}" created with ${questions.length} questions! 🎉`);
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
        setQuestions([{ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
        fetchData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create quiz';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewAttempts = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsLoadingAttempts(true);
    try {
      const res = await api.get<QuizAttempt[]>(`/quizzes/${quiz.quizId}/attempts`);
      if (res.success) setAttempts(res.data);
    } catch {
      toast.error('Failed to load quiz attempts');
    } finally {
      setIsLoadingAttempts(false);
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Quizzes</h1>
          <p className="topbar__subtitle">Build interactive auto-graded quizzes and monitor student scores.</p>
        </div>
        <div className="topbar__right">
          <div className="search-input">
            <Search className="search-input__icon" size={16} />
            <input
              type="text"
              className="search-input__field"
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={() => {
            if (classrooms.length > 0) setClassroomId(classrooms[0].classroomId);
            setIsCreateOpen(true);
          }}>
            <Plus size={16} /> Create Quiz
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">🧠</div>
          <h3 className="empty-state__title">No Quizzes Found</h3>
          <p className="empty-state__text">Create interactive quizzes with auto-grading for your students.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredQuizzes.map((q) => (
            <motion.div
              key={q.quizId}
              className="card"
              whileHover={{ y: -1 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{q.title}</h3>
                  <span className={`badge ${q.status === 'active' ? 'badge--purple' : 'badge--neutral'}`}>
                    {q.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 16 }}>
                  <span>Classroom: <strong>{q.classroomTitle || 'Classroom'}</strong></span>
                  <span>Duration: {q.duration} mins</span>
                  <span>Total Marks: {q.totalMarks}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--outline btn--sm" onClick={() => viewAttempts(q)}>
                  <Eye size={14} /> Attempt Results ({q.attemptCount || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create Quiz Builder */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Create Interactive Quiz</h2>
              <button className="modal__close" onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateQuiz}>
              <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="auth-form__row">
                  <div className="auth-form__group">
                    <label className="auth-form__label">Classroom *</label>
                    <select
                      className="auth-form__select"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                      required
                    >
                      <option value="">Select classroom</option>
                      {classrooms.map((c) => (
                        <option key={c.classroomId} value={c.classroomId}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-form__group">
                    <label className="auth-form__label">Duration (Minutes) *</label>
                    <input
                      type="number"
                      className="auth-form__input"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min={1}
                      max={180}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Quiz Title *</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="e.g. Mid-term Quiz: Binary Trees & Graphs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form__group">
                  <label className="auth-form__label">Description</label>
                  <input
                    type="text"
                    className="auth-form__input"
                    placeholder="Instructions for students..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <hr style={{ borderColor: 'var(--border-secondary)', margin: '4px 0' }} />

                {/* Dynamic Question Builder */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Questions ({questions.length})</h3>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={addQuestion}>
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="card" style={{ padding: 16, backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Question {qIdx + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                          className="auth-form__select"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          value={q.type}
                          onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                        >
                          <option value="mcq">Multiple Choice (MCQ)</option>
                          <option value="true_false">True / False</option>
                        </select>
                        <button type="button" className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => removeQuestion(qIdx)}>
                          <Trash2 size={14} style={{ color: 'var(--danger-500)' }} />
                        </button>
                      </div>
                    </div>

                    <div className="auth-form__group" style={{ marginBottom: 12 }}>
                      <input
                        type="text"
                        className="auth-form__input"
                        placeholder="Question text..."
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                        required
                      />
                    </div>

                    {q.type === 'mcq' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === opt && opt.length > 0}
                              onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)}
                              required
                            />
                            <input
                              type="text"
                              className="auth-form__input"
                              style={{ padding: '8px 12px', fontSize: 13 }}
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                        {['True', 'False'].map((opt) => (
                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === opt}
                              onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Publish Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Attempt Results */}
      {selectedQuiz && (
        <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Quiz Results: {selectedQuiz.title}</h2>
              <button className="modal__close" onClick={() => setSelectedQuiz(null)}>✕</button>
            </div>
            <div className="modal__body">
              {isLoadingAttempts ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading attempt scores...</div>
              ) : attempts.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state__text">No students have taken this quiz yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Score</th>
                      <th>Time Taken</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att) => (
                      <tr key={att.attemptId}>
                        <td style={{ fontWeight: 600 }}>{att.studentName || 'Student'}</td>
                        <td>{att.studentRollNumber || '-'}</td>
                        <td>
                          <span className="badge badge--success" style={{ fontWeight: 700 }}>
                            {att.score} / {selectedQuiz.totalMarks}
                          </span>
                        </td>
                        <td>{Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s</td>
                        <td>{new Date(att.submittedAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
