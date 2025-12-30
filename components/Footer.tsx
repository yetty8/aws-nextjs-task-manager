"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    {
      icon: <Github className="h-6 w-6" />,
      href: "https://github.com/yetty8",
      label: "GitHub",
      color: "hover:text-gray-900 dark:hover:text-white",
    },
    {
      icon: <Linkedin className="h-6 w-6" />,
      href: "https://www.linkedin.com/in/yetbarek-temesgen/",
      label: "LinkedIn",
      color: "hover:text-blue-600 dark:hover:text-blue-400",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      href: "mailto:yetbarek.tech@gmail.com",
      label: "Email",
      color: "hover:text-rose-600 dark:hover:text-rose-400",
    },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px" }}
      variants={footerVariants}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              A modern task management solution to help you stay organized and
              productive.
            </p>
            <div className="flex space-x-2 pt-2">
              {socialLinks.map((social) => (
                <motion.div
                  key={social.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 -m-2" // Improved touch target
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`text-gray-500 dark:text-gray-400 transition-colors text-lg ${social.color}`}
                  >
                    {social.icon}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-base transition-colors py-2 block"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-base text-gray-600 dark:text-gray-400">
              <li className="flex items-start py-1">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <a
                  href="mailto:yetbarek.tech@gmail.com"
                  className="hover:underline break-all"
                >
                  yetbarek.tech@gmail.com
                </a>
              </li>
              <li className="flex items-start py-1">
                <Linkedin className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <a
                  href="https://www.linkedin.com/in/yetbarek-temesgen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Connect on LinkedIn
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            variants={itemVariants}
            className="space-y-4 md:col-span-2 lg:col-span-1"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Subscribe to our newsletter
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Get the latest updates and news.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-3 text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                required
              />
              <Button
                type="submit"
                size="lg"
                className="shrink-0 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white py-3 px-6"
              >
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            &copy; {currentYear} TaskFlow. All rights reserved. Made with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/yetbarek-temesgen/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Yetbarek Temesgen
            </a>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
