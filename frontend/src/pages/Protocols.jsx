import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Protocols = () => {
    const rules = [
        {
            title: "Fair Usage",
            icon: <ShieldAlert size={20} color="#f87171" />,
            content: "No fake or spam Campus Issues. Users found submitting malicious or intentionally false information will face disciplinary action."
        },
        {
            title: "Evidence Requirement",
            icon: <BookOpen size={20} color="#3b82f6" />,
            content: "Provide clear evidence (photos/videos) whenever possible. This helps the administration understand the context and resolve the issue faster."
        },
        {
            title: "Professional Conduct",
            icon: <AlertTriangle size={20} color="#f59e0b" />,
            content: "Maintain professional language in description and responses. Abusive or disrespectful content will result in immediate rejection of the complaint."
        },
        {
            title: "Response Time",
            icon: <ClockIcon size={20} color="#8b5cf6" />,
            content: "The administration aims to provide an initial response within 48 business hours. High-priority issues are prioritized."
        },
        {
            title: "Confidentiality",
            icon: <ShieldAlert size={20} color="#10b981" />,
            content: "Your identity is protected. Campus Issues are handled with strict confidentiality between you and the administration."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Info size={28} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Protocols & Rules</h1>
                </div>
                <p className="text-slate-400 leading-relaxed text-lg">
                    To ensure the integrity and efficiency of the FixMyCampus portal, all users are expected to follow these protocols. These rules help us maintain a safe and productive environment for everyone.
                </p>
            </motion.div>

            <div className="space-y-4">
                {rules.map((rule, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card flex gap-6 items-start !p-6"
                    >
                        <div className="p-3 bg-white/5 rounded-xl flex shrink-0">
                            {rule.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">{rule.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{rule.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 p-8 bg-red-500/5 rounded-2xl border border-red-500/10"
            >
                <h4 className="text-red-400 font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-sm">
                    <AlertTriangle size={20} />
                    Important Notice
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                    FixMyCampus is a serious platform for institutional improvement. Abuse of the system through repetitive irrelevant Campus Issues or harassment will result in permanent suspension of your account and reporting to the Higher Education Board. <strong className="text-red-400 font-bold underline underline-offset-4">If any student files wrong Campus Issues or includes unnecessary content, he/she will be held responsible and face the consequences.</strong>
                </p>
            </motion.div>
        </div>
    );
};

const ClockIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default Protocols;
