import { motion } from 'framer-motion';
import { Shield, Lock, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutPage() {
  const { t, language } = useLanguage();

  const steps = [
    {
      step: '1',
      title: t('about_step1_title'),
      description: t('about_step1_desc'),
    },
    {
      step: '2',
      title: t('about_step2_title'),
      description: t('about_step2_desc'),
    },
    {
      step: '3',
      title: t('about_step3_title'),
      description: t('about_step3_desc'),
    },
  ];

  const techStack = [
    {
      name: 'React',
      category: language === 'hi' ? 'फ्रंटएंड' : 'Frontend',
      description:
        language === 'hi'
          ? 'hooks और functional components के साथ UI लाइब्रेरी'
          : 'UI library with hooks and functional components',
    },
    {
      name: 'Tailwind CSS',
      category: language === 'hi' ? 'फ्रंटएंड' : 'Frontend',
      description: language === 'hi' ? 'utility-first CSS फ्रेमवर्क' : 'Utility-first CSS framework',
    },
    {
      name: 'Monaco Editor',
      category: language === 'hi' ? 'फ्रंटएंड' : 'Frontend',
      description:
        language === 'hi'
          ? 'कोड एडिटिंग के लिए VS Code एडिटर इंजन'
          : 'VS Code editor engine for code editing',
    },
    {
      name: 'FastAPI',
      category: language === 'hi' ? 'बैकएंड' : 'Backend',
      description: language === 'hi' ? 'हाई-परफॉर्मेंस Python वेब फ्रेमवर्क' : 'High-performance Python web framework',
    },
    {
      name: 'CodeBERT',
      category: 'ML',
      description:
        language === 'hi'
          ? 'प्रोग्रामिंग भाषाओं के लिए pre-trained मॉडल'
          : 'Pre-trained model for programming languages',
    },
    {
      name: 'PyTorch',
      category: 'ML',
      description: language === 'hi' ? 'डीप लर्निंग फ्रेमवर्क' : 'Deep learning framework',
    },
    {
      name: 'Firebase',
      category: language === 'hi' ? 'डेटाबेस' : 'Database',
      description:
        language === 'hi' ? 'फीडबैक स्टोर करने के लिए Cloud Firestore' : 'Cloud Firestore for storing feedback',
    },
    {
      name: 'MLflow',
      category: 'MLOps',
      description:
        language === 'hi' ? 'experiment tracking और model management' : 'Experiment tracking and model management',
    },
    {
      name: 'Docker',
      category: language === 'hi' ? 'डेवऑप्स' : 'DevOps',
      description: language === 'hi' ? 'deployment के लिए containerization' : 'Containerization for deployment',
    },
    {
      name: 'GitHub Actions',
      category: 'CI/CD',
      description: language === 'hi' ? 'automated testing और deployment' : 'Automated testing and deployment',
    },
  ];

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
          {t('about_title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('about_subtitle')}
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
          {t('about_how_title')}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((item, index) => (
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
          {t('about_stack_title')}
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

      {/* Why Choose Us */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center bg-gradient-to-br from-primary-500/10 via-primary-900/10 to-transparent dark:from-primary-900/30 dark:via-primary-950/25 dark:to-transparent rounded-2xl p-8 border border-primary-200 dark:border-primary-800"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 shadow-lg shadow-primary-500/25">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {t('about_secure_title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
          {t('about_secure_desc')}
        </p>
        
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-dark-card/50">
            <Lock className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('about_secure_e2e')}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-dark-card/50">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('about_secure_ai')}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-dark-card/50">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('about_secure_fast')}</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
