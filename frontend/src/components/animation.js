import { motion, useAnimation } from 'framer-motion';
import { Cloud, File } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThreeCloudsAnimation({ onComplete }) {
  const cloudControls = useAnimation();
  const fileControls = useAnimation();
  const finalFileControls = useAnimation();
  const [message, setMessage] = useState("Please wait .....");

  useEffect(() => {
    async function sequence() {
      setMessage("Please wait .... ");
      setMessage("Fetching clouds");
      await cloudControls.start('visible');
      setMessage("Fetching chunks from clouds");
      await fileControls.start('visible');
      setMessage("Decrypting chunks");
     // await fileControls.start('merged');
      setMessage("Reconstructing file");
      await fileControls.start('mix');
      await fileControls.start('hid');
      setMessage("File constructed");
      await cloudControls.start('hid');
      await finalFileControls.start('visible');
      setMessage("Please wait, file downloading");

     await new Promise((resolve) => setTimeout(resolve, 5000));
      onComplete();
    }
    sequence();
  }, [cloudControls, fileControls, finalFileControls, onComplete]);

  const cloudVariants = {
    hidden: { opacity: 0, y: -100 },
    hid: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5,
        duration: 1,
        type: 'spring',
      },
    }),
  };

  const fileVariants = {
    hidden: { opacity: 0, y: -50 },
    hid: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      y: 50,
      transition: {
        delay: i * 0.5,
        duration: 1,
        type: 'spring',
      },
    }),
    
    merged: {
      y: 100,
      scale: 1.5,
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    mix: (i) => ({
      x: i === 0 ? 100 : i === 2 ? -100 : 0,
      y: 100,
      scale: 1,
      transition: { duration: 1.5, ease: 'easeIn' },
    }),
  };

  const finalFileVariant = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1.5, transition: { duration: 4, ease: 'easeOut' } },
  };

  return (
    <div>
      <motion.div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4.5rem' }}
        initial="hidden"
        animate={cloudControls}
        variants={cloudVariants}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cloudVariants}
          >
            <div style={{ alignItems: 'center', color: "black" }}>
              <Cloud size={64} color="#38bdf8" />
              <h5> Cloud {i + 1}</h5>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5.5rem' }}>
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5.7rem' }}
          initial="hidden"
          animate={fileControls}
          variants={fileVariants}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fileVariants}
            >
              <File size={32} color="black" />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4.5rem', marginTop: "2rem" }}>
        <motion.div
          initial="hidden"
          animate={finalFileControls}
          variants={finalFileVariant}
        >
          <div style={{ alignItems: 'center', color: "black" }}>
            <File size={128} color="#0ea5e9" style={{ opacity: 0.7 }} />
            <h5> Constructed file</h5>
          </div>
        </motion.div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '5rem', color: 'black' }}>
        <h5>{message}</h5>
      </div>
    </div>
  );
}