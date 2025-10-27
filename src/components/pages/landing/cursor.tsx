import { motion } from "framer-motion";

const SideCursors = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
      <motion.div
        className="absolute -left-48 sm:-left-44 md:-left-40 lg:-left-36 xl:-left-32 2xl:-left-28 3xl:-left-24 top-52 sm:top-60 md:top-72 lg:top-80 xl:top-96 2xl:top-[28rem] 3xl:top-[32rem]"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.svg
          width="800"
          height="400"
          viewBox="0 0 800 400"
          className="w-[400px] h-[200px] sm:w-[500px] sm:h-[250px] md:w-[600px] md:h-[300px] lg:w-[700px] lg:h-[350px] xl:w-[800px] xl:h-[400px] 2xl:w-[900px] 2xl:h-[450px] 3xl:w-[1000px] 3xl:h-[500px]"
          style={{
            width: "clamp(400px, 35vw, 1200px)",
            height: "clamp(200px, 17.5vw, 600px)",
          }}
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 0.5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            <marker
              id="arrowhead-left"
              markerWidth="6"
              markerHeight="5"
              refX="5.5"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 6 2.5, 0 5" fill="#8b5cf6" />
            </marker>
            <linearGradient
              id="gradient-left"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0 350 Q400 200 720 50"
            stroke="url(#gradient-left)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#arrowhead-left)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 2, ease: "easeInOut" },
              opacity: { duration: 1, delay: 0.5 },
            }}
          />
        </motion.svg>
      </motion.div>

      <motion.div
        className="absolute -right-32 sm:-right-28 md:-right-24 lg:-right-20 xl:-right-16 2xl:-right-12 3xl:-right-8 top-1/2 sm:top-2/5 md:top-1/3 lg:top-1/2 xl:top-1/2 2xl:top-1/2 3xl:top-1/2"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      >
        <motion.svg
          width="800"
          height="450"
          viewBox="0 -50 800 450"
          className="w-[400px] h-[200px] sm:w-[500px] sm:h-[250px] md:w-[600px] md:h-[300px] lg:w-[700px] lg:h-[350px] xl:w-[800px] xl:h-[400px] 2xl:w-[900px] 2xl:h-[450px] 3xl:w-[1000px] 3xl:h-[500px]"
          style={{
            width: "clamp(400px, 35vw, 1200px)",
            height: "clamp(200px, 17.5vw, 600px)",
          }}
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, -0.5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <defs>
            <marker
              id="arrowhead-right"
              markerWidth="6"
              markerHeight="5"
              refX="5.5"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 6 2.5, 0 5" fill="#8b5cf6" />
            </marker>
            <linearGradient
              id="gradient-right"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
            </linearGradient>
          </defs>       
          <motion.path
            d="M800 350 Q400 200 80 -50"
            stroke="url(#gradient-right)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#arrowhead-right)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 2, ease: "easeInOut", delay: 0.3 },
              opacity: { duration: 1, delay: 0.8 },
            }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
};

export default SideCursors;