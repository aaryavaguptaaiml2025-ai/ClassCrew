import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        gap: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          CC
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #a855f7, #ec4899, #a855f7)',
            backgroundSize: '200% 100%',
          }}
          className="animate-gradient"
        />
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Loading ClassCrew...
        </p>
      </motion.div>
    </div>
  );
}
