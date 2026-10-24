import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ShieldIcon,
  CompassIcon,
  MapPinIcon,
  AlertIcon,
  PhoneIcon,
  LockIcon,
  WifiOffIcon,
  TrainIcon,
  BusIcon,
  PlaneIcon,
  CarIcon,
  CheckIcon,
  InfoIcon,
  ArrowRightIcon,
  SparklesIcon
} from '../components/common/Icons';
import { getStoredPlans, getActivePlan } from '../services/storage';
import { ADVISOR_SCENARIOS } from '../data/advisorScenarios';

const ICON_COMPONENTS = {
  TrainIcon,
  MapPinIcon,
  AlertIcon,
  WifiOffIcon,
  LockIcon,
  ShieldIcon,
  CompassIcon
};

export const Assistant = () => {
  // Scenario state: defaults to first scenario so user immediately sees rich guidance
  const [selectedScenarioId, setSelectedScenarioId] = useState('transport-disruption');

  // Itinerary context state
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [usePlanContext, setUsePlanContext] = useState(true);

  // Load saved itinerary context (read-only)
  useEffect(() => {
    try {
      const plans = getStoredPlans();
      setSavedPlans(plans);

      const active = getActivePlan();
      if (active) {
        setSelectedPlanId(active.id);
      } else if (plans.length > 0) {
        setSelectedPlanId(plans[0].id);
      }
    } catch (e) {
      console.warn('Could not read saved plans for advisor context:', e);
    }
  }, []);

  const activeItinerary = savedPlans.find((p) => p.id === selectedPlanId) || null;
  const currentScenario = ADVISOR_SCENARIOS.find((s) => s.id === selectedScenarioId) || ADVISOR_SCENARIOS[0];
  const IconComponent = ICON_COMPONENTS[currentScenario.iconName] || CompassIcon;

  // Check backend proxy status (without pretending external live connection if unconfigured)
  const backendProxyUrl = import.meta.env.VITE_AI_BACKEND_URL;
  const isBackendConfigured = Boolean(backendProxyUrl && !backendProxyUrl.includes('localhost:5000'));

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    const detailElement = document.getElementById('scenario-guidance-view');
    if (detailElement) {
      detailElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Header & Feature Intro */}
      <div className="section-intro">
        <div className="kicker">Stage 5 &bull; Travel Safety Advisor</div>
        <h1>Safety Assistant & Crisis Advisor</h1>
        <p>
          Structured, scenario-specific contingency guidance designed primarily for solo female travellers navigating India.
          Select any situation below to view immediate priorities, step-by-step actions, practical backup alternatives, and verified helplines.
        </p>
      </div>

      {/* Advisory Status & Safety Protocol Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-ivory-light)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.25rem',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.85rem', maxWidth: '820px' }}>
          <div style={{ color: 'var(--color-forest)', flexShrink: 0, marginTop: '2px' }}>
            <ShieldIcon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Operational Guidance Mode
              </span>
              <Badge variant="sage">Pre-Verified Scenario Protocols</Badge>
              {isBackendConfigured ? (
                <Badge variant="forest">Secure Backend Gateway Ready</Badge>
              ) : (
                <Badge variant="outline">Built-In Offline Engine</Badge>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.55 }}>
              This advisor operates on pre-verified safety blueprints. External AI intelligence is integrated exclusively through a secure backend proxy to safeguard credentials.
              <strong> EXIT PLAN AI does not automatically track your live position or dispatch emergency services. In situations involving immediate physical danger in India, call 112 directly.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Itinerary Context Selector */}
      {savedPlans.length > 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-sage-light)',
            border: '1px solid var(--color-sage-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.15rem',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ color: 'var(--color-forest)' }}>
              <CompassIcon size={18} />
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Active Trip Context:
              </span>{' '}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                {activeItinerary?.startingLocation || 'Origin'} → {activeItinerary?.destination || 'Destination'} ({activeItinerary?.transportMethod || 'Transit'})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedPlans.length > 1 && (
              <select
                value={selectedPlanId || ''}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={{
                  fontSize: 'var(--text-xs)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-forest)',
                  fontWeight: 600
                }}
                aria-label="Select trip context"
              >
                {savedPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.destination} ({plan.transportMethod})
                  </option>
                ))}
              </select>
            )}

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-forest)' }}>
              <input
                type="checkbox"
                checked={usePlanContext}
                onChange={(e) => setUsePlanContext(e.target.checked)}
                style={{ accentColor: 'var(--color-forest)', width: '15px', height: '15px' }}
              />
              <span>Apply Itinerary Context</span>
            </label>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--color-ivory-light)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
            <InfoIcon size={16} />
            <span>Operating in General Advisory mode. You can formulate a specific trip in the Safety Planner to unlock route-tailored contextual advice.</span>
          </div>
          <a
            href="#/exit-plans"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
          >
            <span>Open Safety Planner</span>
            <ArrowRightIcon size={13} />
          </a>
        </div>
      )}

      {/* Selectable Scenarios Grid */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="kicker">Contingency Directory</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.45rem', margin: 0 }}>
              Select a Travel Scenario
            </h2>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
            7 Core Crisis Situations
          </span>
        </div>

        <div className="grid-3" role="tablist" aria-label="Crisis scenarios">
          {ADVISOR_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            const CardIcon = ICON_COMPONENTS[scenario.iconName] || CompassIcon;

            return (
              <button
                key={scenario.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`scenario-panel-${scenario.id}`}
                id={`scenario-tab-${scenario.id}`}
                onClick={() => handleSelectScenario(scenario.id)}
                className={`scenario-card ${isSelected ? 'is-active' : ''}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: isSelected ? 'var(--color-forest)' : 'var(--color-terracotta)'
                      }}
                    >
                      0{scenario.number}
                    </span>
                    <Badge variant={isSelected ? 'forest' : 'outline'}>
                      {scenario.category}
                    </Badge>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem',
                      color: 'var(--color-forest)',
                      marginBottom: '0.4rem',
                      lineHeight: 1.3
                    }}
                  >
                    {scenario.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-charcoal-muted)',
                      lineHeight: 1.5,
                      margin: 0
                    }}
                  >
                    {scenario.summary}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: isSelected ? 'var(--color-forest)' : 'var(--color-forest-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--color-ivory)' : 'var(--color-forest)'
                    }}
                  >
                    <CardIcon size={15} />
                  </div>

                  <span
                    style={{
                      fontSize: 'var(--text-2xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isSelected ? 'var(--color-forest)' : 'var(--color-charcoal-subtle)'
                    }}
                  >
                    {isSelected ? 'Viewing Guidance' : 'Select Scenario →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          DETAILED STRUCTURED GUIDANCE VIEW
         ========================================================================= */}
      <section id="scenario-guidance-view" style={{ scrollMarginTop: '90px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid var(--color-forest)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ivory)'
              }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: 0 }}>
                Scenario 0{currentScenario.number} &bull; {currentScenario.category}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-forest)',
                  fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
                  margin: 0
                }}
              >
                {currentScenario.title}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, maxWidth: '100%' }}>
            {usePlanContext && activeItinerary && (
              <Badge
                variant="sage"
                icon={CheckIcon}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  maxWidth: '100%'
                }}
              >
                <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>TRIP CONTEXT:</span>
                <span style={{ textTransform: 'none', fontWeight: 600 }}>
                  {activeItinerary.startingLocation
                    ? `${activeItinerary.startingLocation} → ${activeItinerary.destination}`
                    : activeItinerary.destination}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Contextual Notice (if itinerary context active) */}
        {usePlanContext && activeItinerary && currentScenario.getContextualNotes(activeItinerary) && (
          <div
            style={{
              backgroundColor: 'var(--color-sage-light)',
              borderLeft: '4px solid var(--color-forest)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.15rem',
              marginBottom: 'var(--space-6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <CompassIcon size={15} />
              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tailored Itinerary Context ({activeItinerary.startingLocation} → {activeItinerary.destination})
              </strong>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.5 }}>
              {currentScenario.getContextualNotes(activeItinerary)}
            </p>
          </div>
        )}

        {/* 1. Immediate Priority Banner */}
        <div className="priority-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: 'var(--text-2xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-terracotta)'
              }}
            >
              Immediate Priority
            </span>
          </div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-forest)',
              fontWeight: 600,
              lineHeight: 1.45
            }}
          >
            {currentScenario.immediatePriority}
          </div>
        </div>

        {/* 2. Step-by-Step Actions */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div className="kicker">Procedural Response</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', marginBottom: 'var(--space-4)', fontSize: '1.25rem' }}>
            Step-by-Step Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentScenario.stepByStepActions.map((action, index) => (
              <div key={index} className="action-step-item">
                <div className="step-number-badge">{index + 1}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', lineHeight: 1.6, paddingTop: '1px' }}>
                  {action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Practical Backup Options & 4. Things to Avoid (Grid) */}
        <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Practical Backup Options */}
          <Card
            variant="editorial"
            kicker="Contingencies"
            title="Practical Backup Options"
          >
            <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentScenario.practicalBackupOptions.map((opt, idx) => (
                <li key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  {opt}
                </li>
              ))}
            </ul>
          </Card>

          {/* Things to Avoid */}
          <Card
            variant="terracotta"
            kicker="Risk Factors"
            title="Things to Avoid"
          >
            <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentScenario.thingsToAvoid.map((avoid, idx) => (
                <li key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  {avoid}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* 5. Official Help & Emergency Hotlines */}
        <Card
          variant="default"
          kicker="Escalation Protocol"
          title="When and How to Seek Official Help in India"
          subtitle={currentScenario.officialHelp.guidance}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem',
              marginTop: '0.75rem'
            }}
          >
            {/* Primary 112 Card */}
            <div
              style={{
                backgroundColor: 'var(--color-alert-bg)',
                border: '1.5px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-terracotta-dark)', textTransform: 'uppercase' }}>
                  Immediate Danger
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-charcoal)', marginTop: '2px' }}>
                  National Emergency (Police/Med)
                </div>
              </div>
              <a
                href="tel:112"
                className="btn btn-emergency btn-sm"
                style={{ textDecoration: 'none', padding: '0.4rem 0.85rem', fontWeight: 700 }}
              >
                <PhoneIcon size={13} />
                <span>112</span>
              </a>
            </div>

            {/* Scenario-specific helplines */}
            {currentScenario.officialHelp.helplines.map((line, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-ivory-light)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {line.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', marginTop: '2px' }}>
                    {line.note}
                  </div>
                </div>
                <a
                  href={`tel:${line.number}`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', padding: '0.4rem 0.75rem', minWidth: '70px', textAlign: 'center' }}
                >
                  <PhoneIcon size={12} />
                  <span>{line.number}</span>
                </a>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-2xs)',
              color: 'var(--color-charcoal-subtle)',
              fontStyle: 'italic',
              lineHeight: 1.45
            }}
          >
            Emergency lines operate 24/7 across India. Response times vary by local jurisdiction and traffic conditions; EXIT PLAN AI does not guarantee dispatch speeds, booking vacancies, or third-party outcomes.
          </div>
        </Card>
      </section>
    </div>
  );
};
