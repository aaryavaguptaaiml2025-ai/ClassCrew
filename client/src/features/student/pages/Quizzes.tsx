import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Clock, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { api } from '@/services/api';
import type { Quiz, QuizQuestion, QuizAttempt } from '@/types';
import toast from 'react-hot-toast';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quiz Taking Modal State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Score Result Modal State
  const [completedResult, setCompletedResult] = useState<QuizAttempt | null>(null);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Quiz[]>('/quizzes');
      if (res.success) setQuizzes(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Time expired! Submitting your quiz now...');
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  const startQuiz = async (quiz: Quiz) => {
    try {
      setIsLoading(true);
      const res = await api.get<QuizQuestion[]>(`/quizzes/${quiz.quizId}/questions`);
      if (res.success && res.data.length > 0) {
        setQuestions(res.data);
        setActiveQuiz(quiz);
        setUserAnswers({});
        setTimeLeft(quiz.duration * 60); // convert mins to seconds
      } else {
        toast.error('This quiz has no questions available.');
      }
    } catch {
      toast.error('Failed to start quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeTaken = activeQuiz.duration * 60 - timeLeft;
      const res = await api.post<QuizAttempt>(`/quizzes/${activeQuiz.quizId}/submit`, {
        answers: userAnswers,
        timeTaken: Math.max(1, timeTaken),
      });

      if (res.success) {
        setCompletedResult(res.data);
        setActiveQuiz(null);
        toast.success('Quiz submitted! 🎉');
        fetchQuizzes();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="topbar" style={{ padding: 0, margin: 0 }}>
        <div className="topbar__left">
          <h1 className="topbar__title">Quizzes</h1>
          <p className="topbar__subtitle">Take interactive quizzes and receive instant auto-graded feedback.</p>
        </div>
      </div>

      {isLoading && !activeQuiz ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">🧠</div>
          <h3 className="empty-state__title">No Quizzes Available</h3>
          <p className="empty-state__text">You do not have any active or upcoming quizzes at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map((q) => (
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

              <div>
                <button className="btn btn--primary btn--sm" onClick={() => startQuiz(q)}>
                  <Play size={14} /> Start Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Quiz Taking Modal */}
      {activeQuiz && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680, width: '100%' }}>
            <div className="modal__header" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: 16 }}>
              <div>
                <h2 className="modal__title">{activeQuiz.title}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Total Questions: {questions.length} • Total Marks: {activeQuiz.totalMarks}
                </div>
              </div>
              <div className="badge badge--purple" style={{ fontSize: 16, fontWeight: 800, padding: '8px 16px', gap: 6 }}>
                <Clock size={16} /> {formatTimer(timeLeft)}
              </div>
            </div>

            <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 20 }}>
              {questions.map((q, idx) => (
                <div key={q.questionId} className="card" style={{ backgroundColor: 'var(--bg-secondary)', padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                    Q{idx + 1}. {q.question} <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({q.marks} mark{q.marks > 1 ? 's' : ''})</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt) => {
                      const isSelected = userAnswers[q.questionId] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`btn ${isSelected ? 'btn--primary' : 'btn--outline'}`}
                          style={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: isSelected ? 700 : 500 }}
                          onClick={() => selectAnswer(q.questionId, opt)}
                        >
                          <span style={{ opacity: isSelected ? 1 : 0.6 }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal__footer">
              <button type="button" className="btn btn--primary btn--lg" style={{ width: '100%' }} onClick={submitQuiz} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Answers...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Score Result Modal */}
      {completedResult && (
        <div className="modal-overlay" onClick={() => setCompletedResult(null)}>
          <div className="modal" style={{ textAlign: 'center', padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Award size={32} style={{ color: 'var(--success-500)' }} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Quiz Completed!
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your response has been auto-graded.
            </p>

            <div className="card" style={{ background: 'var(--gradient-card)', padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', uppercase: true, letterSpacing: '0.05em' }}>YOUR SCORE</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--brand-purple)', margin: '4px 0' }}>
                {completedResult.score} / {completedResult.totalMarks}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Time Taken: {Math.floor(completedResult.timeTaken / 60)}m {completedResult.timeTaken % 60}s
              </div>
            </div>

            <button className="btn btn--primary btn--full" onClick={() => setCompletedResult(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
