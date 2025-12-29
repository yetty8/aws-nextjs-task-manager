'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Rocket, Shield } from 'lucide-react';

// ---------- Motion Variants ----------
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ---------- Features ----------
const features = [
  { name: 'Lightning Fast', description: 'Quickly add and manage your tasks with our intuitive interface', icon: Zap },
  { name: 'Secure & Private', description: 'Your data is encrypted and only accessible by you', icon: Shield },
  { name: 'Cross-Platform', description: 'Access your tasks from any device, anywhere', icon: Rocket },
];

// ---------- FeatureCard Component ----------
function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      key={feature.name}
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3, delay: 0.1 * index }}
      className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
    >
      <div
        className="absolute -top-6 left-6 h-12 w-12 rounded-md flex items-center justify-center bg-blue-500 text-white"
        aria-hidden="true"
      >
        <feature.icon className="h-6 w-6" />
      </div>
      <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white">{feature.name}</h3>
      <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{feature.description}</p>
    </motion.div>
  );
}

// ---------- HeroButtons Component ----------
function HeroButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {isAuthenticated ? (
        <Button asChild size="lg" className="text-lg">
          <Link href="/tasks">
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <>
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </>
      )}
    </div>
  );
}

// ---------- CTA Component ----------
function CTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="bg-blue-600 dark:bg-blue-700">
      <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to get started?</span>
          <span className="block">Start organizing your tasks today.</span>
        </h2>
        <p className="mt-4 text-xl leading-6 text-blue-100">
          Join thousands of users who are already using TaskFlow.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-white text-blue-600 hover:bg-blue-50 text-lg"
        >
          <Link href={isAuthenticated ? '/tasks' : '/signup'}>
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ---------- HomePage ----------
export default function HomePage() {
  const { data: _session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Organize Your Work & Life
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            TaskFlow helps you stay organized and get more done. Your tasks are safe, synced, and accessible everywhere.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HeroButtons isAuthenticated={isAuthenticated} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to manage tasks
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.name} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTA isAuthenticated={isAuthenticated} />
    </div>
  );
}
