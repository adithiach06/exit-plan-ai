import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ShieldIcon,
  AlertIcon,
  CheckIcon,
  InfoIcon,
  PhoneIcon,
  LockIcon,
  CloseIcon,
  ArrowRightIcon
} from '../components/common/Icons';
import { analyzeMessageLocally, SAMPLE_MESSAGES } from '../services/scamDetector';

export const MessageScanner = () => {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);

  // Handle sample selection
  const handleSelectSample = (sample) => {
    setInputText(sample.text);
    setActiveSampleId(sample.id);
    setValidationError('');
    setAnalysisResult(null);
  };

  // Clear input and analysis
  const handleClear = () => {
    setInputText('');
    setValidationError('');
    setAnalysisResult(null);
    setActiveSampleId(null);
  };

  // Run analysis
  const handleAnalyze = (e) => {
    if (e) e.preventDefault();

    const trimmed = (inputText || '').trim();

    if (!trimmed) {
      setValidationError('Please paste or type a travel message to analyze.');
      setAnalysisResult(null);
      return;
    }

    if (trimmed.length < 15) {
      setValidationError(
        'Message is too short to analyse meaningfully. Please provide more content (at least 15 characters), such as the complete SMS, WhatsApp message, or payment request.'
      );
      setAnalysisResult(null);
      return;
    }

    setValidationError('');
    setIsScanning(true);

    // Brief processing timeout for smooth UI transition
    setTimeout(() => {
      const result = analyzeMessageLocally(trimmed);
      setAnalysisResult(result);
      setIsScanning(false);

      // Smooth scroll to results
      const resultsElement = document.getElementById('scam-analysis-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 280);
  };

  // Helper to determine risk meter bar color
  const getMeterColor = (level) => {
    switch (level) {
      case 'Critical':
        return 'var(--color-danger, #991B1B)';
      case 'High':
        return 'var(--color-terracotta, #C9785B)';
      case 'Medium':
        return 'var(--color-warning, #B45309)';
      case 'Low':
      default:
        return 'var(--color-forest, #183D32)';
    }
  };

  return (
    <div>
      {/* Editorial Header */}
      <div className="section-intro">
        <div className="kicker">Stage 3 &bull; Travel Cybersecurity</div>
        <h1>Scam Shield &amp; Message Scanner</h1>
        <p>
          Analyze suspicious travel-related communications: fraudulent hotel cancellation alerts,
          fake cab driver UPI payment requests, unverified discount lotteries, off-platform booking diversion,
          and digital arrest extortion attempts.
        </p>
      </div>

      {/* Local Privacy & Security Notice */}
      <div
        style={{
          backgroundColor: 'var(--color-ivory-light)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ color: 'var(--color-forest)', flexShrink: 0, marginTop: '2px' }}>
          <ShieldIcon size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Client-Side Threat Heuristics
            </span>
            <Badge variant="sage">100% Local In-Browser Processing</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.55 }}>
            Message analysis runs locally on your device using deterministic cybersecurity heuristics. Your pasted text is
            never transmitted to external servers, uploaded to third-party databases, or retained in persistent storage.
          </p>
        </div>
      </div>

      {/* Input Form & Sample Chips Card */}
      <Card
        variant="editorial"
        kicker="Message Inspection"
        title="Analyze Suspicious Communication"
        subtitle="Paste an SMS, WhatsApp message, email, or off-platform payment request below to detect travel fraud signatures."
      >
        {/* Sample Messages Quick Picker */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-forest)' }}>
              Or Load a Representative Sample:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SAMPLE_MESSAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="sample-chip"
                style={{
                  borderColor: activeSampleId === sample.id ? 'var(--color-forest)' : 'var(--border-medium)',
                  backgroundColor: activeSampleId === sample.id ? 'var(--color-sage-light)' : 'var(--color-ivory-light)'
                }}
              >
                <span>{sample.title}</span>
                <span
                  style={{
                    fontSize: 'var(--text-2xs)',
                    color:
                      sample.riskLevel === 'Critical'
                        ? 'var(--color-danger, #991B1B)'
                        : sample.riskLevel === 'High'
                        ? 'var(--color-terracotta-dark)'
                        : sample.riskLevel === 'Medium'
                        ? 'var(--color-warning, #B45309)'
                        : 'var(--color-forest)',
                    fontWeight: 700
                  }}
                >
                  ({sample.tag})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea Form */}
        <form onSubmit={handleAnalyze} noValidate>
          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label htmlFor="message-input" className="form-label" style={{ margin: 0 }}>
                <span>Message Text<span className="required-indicator">*</span></span>
              </label>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-subtle)', fontFamily: 'var(--font-mono)' }}>
                {inputText.length} characters &bull; {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              id="message-input"
              name="messageText"
              rows="6"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Paste suspicious travel SMS, WhatsApp text, hotel cancellation message, or payment QR request here..."
              className={`form-textarea ${validationError ? 'input-invalid' : ''}`}
              style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'message-input-error' : undefined}
            ></textarea>

            {validationError && (
              <div id="message-input-error" className="form-error" role="alert">
                <AlertIcon size={14} />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: 'var(--space-2)'
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                type="submit"
                variant="primary"
                icon={ShieldIcon}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning Threat Signatures...' : 'Scan Message'}
              </Button>

              {(inputText || analysisResult) && (
                <Button
                  type="button"
                  variant="ghost"
                  icon={CloseIcon}
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </div>

            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-subtle)' }}>
              Deterministic threat pattern engine &bull; Offline resilient
            </span>
          </div>
        </form>
      </Card>

      {/* =========================================================================
          ANALYSIS RESULTS BREAKDOWN
         ========================================================================= */}
      {analysisResult && (
        <section
          id="scam-analysis-results"
          style={{ marginTop: 'var(--space-8)', scrollMarginTop: '80px' }}
          role="region"
          aria-live="polite"
        >
          {/* Main Risk Assessment Card */}
          <Card
            variant={
              analysisResult.riskLevel === 'Critical' || analysisResult.riskLevel === 'High'
                ? 'terracotta'
                : analysisResult.riskLevel === 'Medium'
                ? 'editorial'
                : 'default'
            }
            kicker="Cybersecurity Risk Assessment"
            title={
              analysisResult.riskLevel === 'Critical'
                ? 'Critical Threat: Coercive Fraud / Credential Theft'
                : analysisResult.riskLevel === 'High'
                ? 'High Risk: Travel Fraud Indicators Detected'
                : analysisResult.riskLevel === 'Medium'
                ? 'Caution Advised: Unverified Travel Patterns'
                : 'Low Risk Indicators Detected'
            }
            headerAction={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant={analysisResult.riskBadgeVariant}>
                  {(analysisResult.riskLevel === 'Critical' || analysisResult.riskLevel === 'High') && <AlertIcon size={12} />}
                  {analysisResult.riskLevel === 'Low' && <CheckIcon size={12} />}
                  <span>{analysisResult.riskLevel} Risk</span>
                </Badge>
                <Badge variant="outline">
                  <span>Score: {analysisResult.riskScore} / 100</span>
                </Badge>
              </div>
            }
          >
            {/* Visual Numerical Risk Meter (0 to 100) */}
            <div className="risk-meter-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Threat Risk Index: {analysisResult.riskScore} / 100
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: getMeterColor(analysisResult.riskLevel)
                  }}
                >
                  {analysisResult.riskLevel === 'Critical'
                    ? 'Critical Threat (80–100)'
                    : analysisResult.riskLevel === 'High'
                    ? 'High Risk (51–79)'
                    : analysisResult.riskLevel === 'Medium'
                    ? 'Moderate Caution (21–50)'
                    : 'Low Risk (0–20)'}
                </span>
              </div>
              <div className="risk-meter-track" role="progressbar" aria-valuenow={analysisResult.riskScore} aria-valuemin="0" aria-valuemax="100">
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${Math.max(5, analysisResult.riskScore)}%`,
                    backgroundColor: getMeterColor(analysisResult.riskLevel)
                  }}
                ></div>
              </div>
            </div>

            {/* Risk Summary Diagnostic */}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              {analysisResult.summary}
            </p>

            {/* Assessment Limitations Notice */}
            <div
              style={{
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-charcoal-muted)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-6)'
              }}
            >
              <strong>Heuristic Assessment Limitation:</strong> This analysis evaluates known travel phishing patterns,
              credential harvest techniques, and domain spoofing signatures. An assessment of "Low Risk" indicates that
              no overt deceptive keywords were identified, but does not guarantee that a sender or transaction is authentic.
              Conversely, small rural homestays in India occasionally accept personal UPI legitimately. Always verify independently through official contact channels before transferring funds.
            </div>

            {/* Highlighted / Extracted Suspicious Phrases */}
            {analysisResult.extractedPhrases.length > 0 && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Extracted Threat Signatures ({analysisResult.extractedPhrases.length})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {analysisResult.extractedPhrases.map((phrase, idx) => (
                    <span key={idx} className="phrase-tag">
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Warning Signs (Categorized & Deduplicated) */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Detected Warning Signs ({analysisResult.warnings.length})
              </div>

              {analysisResult.warnings.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-sage-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-sage-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <CheckIcon size={18} />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest)' }}>
                      No Known Travel Threat Patterns Triggered
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', margin: 0 }}>
                      The message does not contain urgent payment countdowns, OTP requests, shortened URLs, location requests, or obvious platform bypass terms.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {analysisResult.warnings.map((warning) => (
                    <div
                      key={warning.id}
                      className={`warning-item-card ${
                        warning.severity === 'critical'
                          ? 'warning-critical'
                          : warning.severity === 'high'
                          ? 'warning-high'
                          : 'warning-medium'
                      }`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-forest)' }}>
                          {warning.title}
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <Badge variant={warning.severity === 'critical' ? 'alert' : 'outline'}>
                            {warning.category}
                          </Badge>
                          <Badge
                            variant={
                              warning.severity === 'critical'
                                ? 'alert'
                                : warning.severity === 'high'
                                ? 'terracotta'
                                : 'outline'
                            }
                          >
                            {warning.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.55 }}>
                        {warning.description}
                      </p>

                      {warning.whyItMatters && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.45rem 0.65rem',
                            backgroundColor: 'var(--color-ivory-light)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--color-charcoal-muted)',
                            lineHeight: 1.45
                          }}
                        >
                          <strong style={{ color: 'var(--color-forest)' }}>Why this matters:</strong> {warning.whyItMatters}
                        </div>
                      )}

                      {warning.snippet && (
                        <div style={{ marginTop: '0.4rem', fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)' }}>
                          Matched phrase: <span className="phrase-tag">"{warning.snippet}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Action Steps */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Recommended Immediate Actions
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResult.recommendedSteps.map((step, idx) => (
                  <li key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ul>
            </div>

            {/* Independent Sender Verification Guide */}
            <div style={{ marginBottom: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Independent Verification Guide
              </div>
              <div className="grid-2">
                {analysisResult.verificationChannels.map((channel, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--color-ivory-light)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '0.2rem' }}>
                      {channel.channel}
                    </div>
                    <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', margin: 0, lineHeight: 1.5 }}>
                      {channel.guidance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account & Payment Protection Callout (Helplines 1930 & 112) */}
            <div
              style={{
                backgroundColor: 'var(--color-alert-bg)',
                border: '1.5px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LockIcon size={16} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-terracotta-dark)', textTransform: 'uppercase' }}>
                    Cyber Crime &amp; Physical Safety Escalation (India)
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: '0.25rem 0 0 0', lineHeight: 1.45 }}>
                  If you transferred money or compromised banking credentials, dial <strong>1930</strong> immediately. If you feel physically threatened or monitored, dial <strong>112</strong> / <strong>1091</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href="tel:1930"
                  className="btn btn-emergency btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <PhoneIcon size={13} />
                  <span>Dial 1930 (Cyber)</span>
                </a>
                <a
                  href="tel:112"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <PhoneIcon size={13} />
                  <span>Dial 112 (SOS)</span>
                </a>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Educational Threat Intel Grid */}
      <section style={{ marginTop: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div className="kicker">Travel Threat Defense</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.35rem', margin: 0 }}>
            Common Solo Travel Scams in India
          </h2>
        </div>

        <div className="grid-3">
          <Card
            variant="default"
            kicker="Hotel Fraud"
            title="Fake Manager UPI Traps"
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
              Scammers harvest guest names from unverified booking portals and send urgent WhatsApp messages claiming the booking
              will be released unless advance payment is sent to a personal QR code.
            </p>
          </Card>

          <Card
            variant="default"
            kicker="Transit Phishing"
            title="Fake Train Cancellation SMS"
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
              Phishing messages imitate IRCTC claiming unexpected train cancellations and offering replacement links (e.g., bit.ly or spoofed domains) to steal OTPs and bank credentials.
            </p>
          </Card>

          <Card
            variant="default"
            kicker="Extortion Scams"
            title="Digital Arrest & Video Coercion"
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
              Imposters posing as police or airport customs officers call travellers, claim an illegal parcel was seized in their name, and threaten immediate arrest unless "clearance deposits" are transferred.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
