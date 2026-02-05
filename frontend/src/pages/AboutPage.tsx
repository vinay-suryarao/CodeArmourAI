import { motion } from 'framer-motion';
import { Shield, Github, ExternalLink } from 'lucide-react';

const techStack = [
  { name: 'React', category: 'Frontend', description: 'UI library with hooks and functional components' },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework' },
  { name: 'Monaco Editor', category: 'Frontend', description: 'VS Code editor engine for code editing' },
  { name: 'FastAPI', category: 'Backend', description: 'High-performance Python web framework' },
  { name: 'CodeBERT', category: 'ML', description: 'Pre-trained model for programming languages' },
  { name: 'PyTorch', category: 'ML', description: 'Deep learning framework' },
  { name: 'Firebase', category: 'Database', description: 'Cloud Firestore for storing feedback' },
  { name: 'MLflow', category: 'MLOps', description: 'Experiment tracking and model management' },
  { name: 'Docker', category: 'DevOps', description: 'Containerization for deployment' },
  { name: 'GitHub Actions', category: 'CI/CD', description: 'Automated testing and deployment' },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500/10 mb-6">
          <Shield className="w-10 h-10 text-primary-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          About CodeArmour AI
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          An AI-powered Static Application Security Testing (SAST) tool designed to detect 
          security vulnerabilities in source code using deep learning.
        </p>
      </motion.div>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Input Code',
              description: 'Paste your code or upload a file. We support multiple programming languages.',
            },
            {
              step: '2',
              title: 'AI Analysis',
              description: 'Our CodeBERT model analyzes code semantics to detect vulnerability patterns.',
            },
            {
              step: '3',
              title: 'Get Results',
              description: 'Receive detailed vulnerability reports with severity levels and fix recommendations.',
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center text-sm">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 mt-2">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Technology Stack
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              className="p-4 bg-white dark:bg-dark-card rounded-lg border border-slate-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                {tech.category}
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-white mt-1">
                {tech.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Open Source */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center bg-slate-100 dark:bg-dark-card rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Open Source
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
          CodeArmour AI is completely open source. Contribute, report issues, or fork it for your own use.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/vinay-suryarao/CodeArmour"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Github className="w-5 h-5" />
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.section>
    </div>
  );
}
