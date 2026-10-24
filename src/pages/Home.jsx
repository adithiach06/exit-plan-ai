import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ShieldIcon,
  CompassIcon,
  MapPinIcon,
  MessageSquareIcon,
  LockIcon,
  SparklesIcon,
  ArrowRightIcon,
  AlertIcon
} from '../components/common/Icons';

export const Home = ({ onRouteChange }) => {
  const roadmapModules = [
    {
      id: 'exit-plans',
      stage: 'Stage 1',
      title: 'Backup Travel Plans',
      desc: 'Formulate contingency itineraries, alternative transit routes, and emergency shelter checkpoints before departure.',
      status: 'Ready for Implementation',
      statusVariant: 'sage',
      icon: CompassIcon
    },
    {
      id: 'map',
      stage: 'Stage 2',
      title: 'Safe Havens Map',
      desc: 'Locate 24/7 verified safe havens, all-women police desks, verified medical clinics, and railway help points across India.',
      status: 'Ready for Implementation',
      statusVariant: 'sage',
      icon: MapPinIcon
    },
    {
      id: 'shield',
      stage: 'Stage 3',
      title: 'Scam & Message Shield',
      desc: 'Verify suspicious booking confirmations, fake travel agent SMS messages, and fake transit alerts using AI verification.',
      status: 'Ready for Implementation',
      statusVariant: 'sage',
      icon: MessageSquareIcon
    },
    {
      id: 'vault',
      stage: 'Stage 4',
      title: 'Offline Safety Vault',
      desc: 'Retain offline copies of vital documents, emergency contacts, medical notes, and offline-accessible SOS instructions.',
      status: 'Ready for Implementation',
      statusVariant: 'sage',
      icon: LockIcon
    },
    {
      id: 'advisor',
      stage: 'Stage 5',
      title: 'AI Travel Advisor',
      desc: 'Context-aware intelligence for solo travellers: regional cultural guidance, curfew alerts, and real-time safe travel briefings.',
      status: 'Ready for Implementation',
      statusVariant: 'sage',
      icon: SparklesIcon
    }
  ];

  return (
    <div>
      {/* Editorial Hero Section */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-10)',
          marginBottom: 'var(--space-10)'
        }}
      >
        <div style={{ maxWidth: '860px' }}>
          <div className="kicker">Travel Resilience Platform &bull; Solo Travel India</div>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              lineHeight: 1.15,
              marginBottom: 'var(--space-4)',
              color: 'var(--color-forest)'
            }}
          >
            When Plan A Fails,<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-terracotta)' }}>
              You're Not Out of Options.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--color-charcoal-muted)',
              marginBottom: 'var(--space-6)'
            }}
          >
            EXIT PLAN AI is an AI-powered travel safety and cybersecurity application engineered
            primarily for solo female travellers across India. It bridges pre-trip risk preparedness,
            instant offline recovery protocols, and cybersecurity vigilance.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              icon={CompassIcon}
              onClick={() => onRouteChange('exit-plans')}
            >
              Explore Exit Plans
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={MapPinIcon}
              onClick={() => onRouteChange('map')}
            >
              Safe Havens Directory
            </Button>
          </div>
        </div>
      </section>

      {/* Foundational Pillars Grid */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="kicker">Core System Capabilities</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)' }}>
              Modular Safety Architecture
            </h2>
          </div>
          <p style={{ maxWidth: '420px', fontSize: 'var(--text-sm)', color: 'var(--color-charcoal-muted)', margin: 0 }}>
            Constructed modularly for staged implementation, offline reliability, and low-bandwidth resilience.
          </p>
        </div>

        <div className="grid-3">
          {roadmapModules.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                variant="default"
                kicker={item.stage}
                title={item.title}
                subtitle={item.desc}
                headerAction={
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--color-forest-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-forest)'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                }
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={item.statusVariant}>{item.status}</Badge>
                    <button
                      onClick={() => onRouteChange(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Inspect</span>
                      <ArrowRightIcon size={14} />
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      </section>

      {/* Editorial Travel Safety In India Note */}
      <section
        style={{
          backgroundColor: 'var(--color-sage-light)',
          border: '1px solid var(--color-sage-dark)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)'
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div className="kicker" style={{ color: 'var(--color-forest)' }}>
            Contextual Intelligence
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              color: 'var(--color-forest)',
              marginBottom: '0.75rem'
            }}
          >
            Engineered for Solo Travellers in India
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', lineHeight: 1.6, marginBottom: '1rem' }}>
            From nighttime train connections to remote hill stations in Himachal or bustling metro stations in Delhi,
            unexpected disruptions happen. EXIT PLAN AI equips travellers with pre-verified Plan B routes, verified
            women safety desks (Mahila Police Helpdesks), and immediate cyber verification to avoid travel fraud.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="forest">IRCTC & Railway Verified</Badge>
            <Badge variant="forest">Local Offline Storage</Badge>
            <Badge variant="forest">Zero Secret Leaks</Badge>
            <Badge variant="terracotta">112 / 1091 Direct Link</Badge>
          </div>
        </div>
      </section>
    </div>
  );
};
