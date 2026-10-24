import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  LockIcon,
  PhoneIcon,
  ShieldIcon,
  CheckIcon,
  AlertIcon,
  CalendarIcon,
  MapPinIcon,
  TrainIcon,
  BusIcon,
  PlaneIcon,
  CarIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  InfoIcon,
  PrinterIcon,
  RefreshCwIcon,
  ExternalLinkIcon
} from '../components/common/Icons';
import {
  DEFAULT_INDIA_HOTLINES,
  getStoredPlans,
  getActivePlan,
  getActivePlanId,
  getPersonalContacts,
  savePersonalContact,
  deletePersonalContact,
  getSafetyChecklist,
  saveSafetyChecklist,
  resetSafetyChecklist
} from '../services/storage';

export const SafetyVault = () => {
  // Navigation tabs within Vault: 'contacts' | 'checklist' | 'trips' | 'summary'
  const [activeTab, setActiveTab] = useState('contacts');

  // Stored plans state
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  // Personal emergency contacts state
  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    relationship: 'Family / Parent',
    phone: '',
    notes: ''
  });
  const [contactFormErrors, setContactFormErrors] = useState({});

  // Delete contact confirmation modal
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Personal safety checklist state
  const [checklist, setChecklist] = useState([]);
  const [isResetChecklistModalOpen, setIsResetChecklistModalOpen] = useState(false);

  // Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Load stored data on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = () => {
    // 1. Saved Plans
    const plans = getStoredPlans();
    setSavedPlans(plans);
    const active = getActivePlan();
    setActivePlan(active);

    // 2. Personal Emergency Contacts
    const storedContacts = getPersonalContacts();
    setContacts(storedContacts);

    // 3. Safety Checklist
    const storedChecklist = getSafetyChecklist();
    setChecklist(storedChecklist);
  };

  const showTemporaryFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3500);
  };

  // ---------------------------------------------------------------------------
  // Contact Form Handlers
  // ---------------------------------------------------------------------------
  const handleOpenAddContactModal = () => {
    setEditingContact(null);
    setContactFormData({
      name: '',
      relationship: 'Family / Parent',
      phone: '',
      notes: ''
    });
    setContactFormErrors({});
    setIsContactModalOpen(true);
  };

  const handleOpenEditContactModal = (contact) => {
    setEditingContact(contact);
    setContactFormData({
      name: contact.name,
      relationship: contact.relationship || 'Family / Parent',
      phone: contact.phone,
      notes: contact.notes || ''
    });
    setContactFormErrors({});
    setIsContactModalOpen(true);
  };

  const validateContactForm = () => {
    const errors = {};
    if (!contactFormData.name || !contactFormData.name.trim()) {
      errors.name = 'Contact name is required.';
    }

    const phone = (contactFormData.phone || '').trim();
    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        errors.phone = 'Please enter a valid phone number with 8 to 15 digits (e.g. +91 98765 43210).';
      }
    }

    setContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveContact = (e) => {
    if (e) e.preventDefault();
    if (!validateContactForm()) return;

    const contactToSave = {
      ...(editingContact ? { id: editingContact.id } : {}),
      name: contactFormData.name.trim(),
      relationship: contactFormData.relationship.trim(),
      phone: contactFormData.phone.trim(),
      notes: contactFormData.notes.trim()
    };

    const res = savePersonalContact(contactToSave);
    if (res.success) {
      setContacts(res.contacts);
      setIsContactModalOpen(false);
      showTemporaryFeedback(
        editingContact ? 'Emergency contact updated.' : 'Emergency contact added successfully.'
      );
    } else {
      setContactFormErrors({ submit: res.error || 'Failed to save contact.' });
    }
  };

  const handleConfirmDeleteContact = () => {
    if (!contactToDelete) return;
    const res = deletePersonalContact(contactToDelete.id);
    if (res.success) {
      setContacts(res.contacts);
      setIsDeleteModalOpen(false);
      setContactToDelete(null);
      showTemporaryFeedback('Contact removed from your vault.');
    }
  };

  // ---------------------------------------------------------------------------
  // Checklist Handlers
  // ---------------------------------------------------------------------------
  const handleToggleChecklistItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    saveSafetyChecklist(updated);
  };

  const handleConfirmResetChecklist = () => {
    const res = resetSafetyChecklist();
    if (res.success) {
      setChecklist(res.checklist);
      setIsResetChecklistModalOpen(false);
      showTemporaryFeedback('Safety checklist reset for your next trip.');
    }
  };

  // Calculate checklist progress
  const completedChecklistCount = checklist.filter((item) => item.checked).length;
  const checklistPercentage =
    checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Navigate to Safety Planner
  // ---------------------------------------------------------------------------
  const handleNavigateToPlanner = () => {
    window.location.hash = '#/exit-plans';
  };

  // ---------------------------------------------------------------------------
  // Print Handler
  // ---------------------------------------------------------------------------
  const handlePrintSummary = () => {
    window.print();
  };

  // Transport Icon Helper
  const getTransportIcon = (method) => {
    switch ((method || '').toLowerCase()) {
      case 'bus':
        return <BusIcon size={16} />;
      case 'flight':
        return <PlaneIcon size={16} />;
      case 'car':
        return <CarIcon size={16} />;
      case 'train':
      default:
        return <TrainIcon size={16} />;
    }
  };

  return (
    <div>
      {/* =========================================================================
          PRINT ONLY VIEW: High-Legibility Emergency Travel Safety Document
          ========================================================================= */}
      <div className="print-only">
        {/* Header */}
        <div className="print-header">
          <div>
            <div style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#C9785B' }}>
              EXIT PLAN AI &bull; Travel Safety Vault Summary
            </div>
            <h1>Emergency & Travel Safety Reference Sheet</h1>
            <div style={{ fontSize: '7pt', color: '#555555' }}>
              Universal SOS Helpline: <strong>112</strong> &bull; Women Helpline: <strong>1091</strong> &bull; Stored Locally on Device
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '7pt', color: '#555555' }}>
            <div>Printed: {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
            <div style={{ fontWeight: 600, color: '#183D32' }}>Offline Verified Document</div>
          </div>
        </div>

        {/* Section 1: Active Trip Overview */}
        <div className="print-section">
          <div className="print-section-title">
            <span>1. Active Travel Itinerary</span>
            {activePlan && (
              <span style={{ fontSize: '7pt', textTransform: 'none', fontWeight: 500 }}>
                Transport: {activePlan.transportMethod || 'Train'}
              </span>
            )}
          </div>
          {activePlan ? (
            <table className="print-table">
              <tbody>
                <tr>
                  <td style={{ width: '18%', fontWeight: 700 }}>Route:</td>
                  <td style={{ width: '42%' }}>
                    {activePlan.startingLocation ? `${activePlan.startingLocation} → ` : ''}
                    {activePlan.destination}
                  </td>
                  <td style={{ width: '18%', fontWeight: 700 }}>Travel Dates:</td>
                  <td>
                    {activePlan.departureDate || 'N/A'} {activePlan.returnDate ? `to ${activePlan.returnDate}` : ''}
                  </td>
                </tr>
                {(activePlan.accommodation || activePlan.notes) && (
                  <tr>
                    {activePlan.accommodation && (
                      <>
                        <td style={{ fontWeight: 700 }}>Accommodation:</td>
                        <td>{activePlan.accommodation}</td>
                      </>
                    )}
                    {activePlan.notes && (
                      <>
                        <td style={{ fontWeight: 700 }}>Emergency Notes:</td>
                        <td colSpan={activePlan.accommodation ? 1 : 3}>{activePlan.notes}</td>
                      </>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '7.5pt', fontStyle: 'italic', color: '#666666', padding: '2pt 0' }}>
              No active travel plan was designated in the Safety Planner at the time of printing.
            </div>
          )}
        </div>

        {/* Section 2: Personal Emergency Contacts */}
        <div className="print-section">
          <div className="print-section-title">
            <span>2. Personal Trusted Emergency Contacts</span>
            <span style={{ fontSize: '7pt', textTransform: 'none', fontWeight: 500 }}>
              {contacts.length} Contact{contacts.length !== 1 ? 's' : ''} on File
            </span>
          </div>
          {contacts.length > 0 ? (
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Name</th>
                  <th style={{ width: '22%' }}>Relationship</th>
                  <th style={{ width: '26%' }}>Phone Number</th>
                  <th>Location / Notes</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td style={{ fontWeight: 700 }}>{contact.name}</td>
                    <td>{contact.relationship}</td>
                    <td style={{ fontWeight: 600 }}>{contact.phone}</td>
                    <td>{contact.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '7.5pt', fontStyle: 'italic', color: '#666666', padding: '2pt 0' }}>
              No personal emergency contacts have been added to the Safety Vault. (Add contacts in the Emergency Contacts tab)
            </div>
          )}
        </div>

        {/* Section 3: National Emergency Hotlines */}
        <div className="print-section">
          <div className="print-section-title">
            <span>3. India 24/7 National Emergency Hotlines</span>
            <span style={{ fontSize: '7.5pt', textTransform: 'none', fontWeight: 500 }}>Toll-Free All India</span>
          </div>
          <div className="print-grid-2">
            {DEFAULT_INDIA_HOTLINES.map((h) => (
              <div key={h.number} className="print-hotline-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#183D32', fontSize: '9pt' }}>{h.name}</strong>
                  <strong style={{ color: h.priority === 'high' ? '#C9785B' : '#183D32', fontSize: '9.5pt' }}>
                    {h.number}
                  </strong>
                </div>
                <div style={{ color: '#555555', marginTop: '1.5pt' }}>{h.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Checklist Summary */}
        <div className="print-section">
          <div className="print-section-title">
            <span>4. Solo Travel Safety Readiness Checklist</span>
            <span
              style={{
                fontSize: '7.5pt',
                textTransform: 'none',
                fontWeight: 600,
                color: checklistPercentage === 100 ? '#183D32' : '#C9785B'
              }}
            >
              {completedChecklistCount} of {checklist.length} Verified ({checklistPercentage}%)
            </span>
          </div>
          <div className="print-grid-2">
            {checklist.map((item) => (
              <div key={item.id} className="print-checklist-item">
                <span style={{ fontWeight: 700, minWidth: '15pt' }}>{item.checked ? '[✓]' : '[  ]'}</span>
                <span style={{ color: item.checked ? '#183D32' : '#333333' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Print Footer */}
        <div className="print-footer">
          <span>
            <strong>Offline Safeguard:</strong> Carry this physical sheet in your daypack. It remains accessible if battery or cellular networks fail.
          </span>
          <span>EXIT PLAN AI &bull; India Solo Travel Safety</span>
        </div>
      </div>

      {/* =========================================================================
          SCREEN VIEW: Interactive Safety Vault Interface
          ========================================================================= */}
      <div className="no-print">
        {/* Editorial Section Introduction */}
        <div className="section-intro">
          <div className="kicker">Stage 4 &bull; Offline Security Hub</div>
          <h1>Offline Safety Vault</h1>
          <p>
            Secure, device-only persistence for your personal emergency contacts, active trip overview,
            preparation checklist, and one-touch emergency summary.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-forest)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckIcon size={16} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Local Storage Privacy & Isolation Banner */}
        <div
          style={{
            padding: '0.9rem 1.25rem',
            backgroundColor: 'var(--color-ivory-light)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ color: 'var(--color-forest)' }}>
              <LockIcon size={20} />
            </span>
            <div>
              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-forest)' }}>
                Zero-Cloud Local Privacy
              </strong>
              <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', margin: 0 }}>
                All records are bound strictly to this browser's local storage. No passwords, bank details, or OTPs are
                stored.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="sage">Local Storage Active</Badge>
            <button
              onClick={handlePrintSummary}
              className="btn btn-secondary btn-sm"
              title="Print Emergency Safety Summary"
            >
              <PrinterIcon size={14} />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

        {/* Vault Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-6)',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}
        >
          <button
            onClick={() => setActiveTab('contacts')}
            className={`btn btn-sm ${activeTab === 'contacts' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
          >
            <PhoneIcon size={14} />
            <span>Emergency Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`btn btn-sm ${activeTab === 'checklist' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
          >
            <CheckIcon size={14} />
            <span>Safety Checklist ({completedChecklistCount}/{checklist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`btn btn-sm ${activeTab === 'trips' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
          >
            <CalendarIcon size={14} />
            <span>Saved Plans ({savedPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
          >
            <PrinterIcon size={14} />
            <span>Emergency Summary</span>
          </button>
        </div>

        {/* =====================================================================
            TAB 1: EMERGENCY CONTACTS (Personal + National Directory)
            ===================================================================== */}
        {activeTab === 'contacts' && (
          <div>
            {/* Personal Contacts Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-forest)', margin: 0 }}>
                  Personal Emergency Contacts
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.2rem' }}>
                  Trusted family, friends, or local hosts who can be contacted immediately in distress.
                </p>
              </div>

              <button onClick={handleOpenAddContactModal} className="btn btn-primary btn-sm">
                <PlusIcon size={14} />
                <span>Add Emergency Contact</span>
              </button>
            </div>

            {/* Verification Advisory Callout */}
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-charcoal-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <InfoIcon size={16} />
              <span>
                <strong>Verification Tip:</strong> Verify phone numbers beforehand and inform contacts of your travel
                schedule so they can respond quickly if contacted.
              </span>
            </div>

            {/* Personal Contacts List */}
            {contacts.length === 0 ? (
              <Card
                variant="default"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-8) var(--space-4)',
                  backgroundColor: '#FFFFFF',
                  marginBottom: 'var(--space-8)'
                }}
              >
                <div style={{ color: 'var(--color-charcoal-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <UserIcon size={32} />
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  No personal emergency contacts added yet
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', maxWidth: '400px', margin: '0 auto 1rem auto' }}>
                  Add at least 1-2 trusted contacts (such as family, close friends, or your accommodation host) to keep
                  them accessible even without cell data.
                </p>
                <button onClick={handleOpenAddContactModal} className="btn btn-primary btn-sm">
                  <PlusIcon size={14} />
                  <span>Add First Contact</span>
                </button>
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minm(280px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-8)'
                }}
              >
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-smooth)'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.35rem'
                        }}
                      >
                        <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', margin: 0 }}>
                          {contact.name}
                        </h3>
                        <Badge variant="sage">{contact.relationship}</Badge>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--color-charcoal)',
                          margin: '0.45rem 0'
                        }}
                      >
                        <PhoneIcon size={14} />
                        <a
                          href={`tel:${contact.phone}`}
                          style={{
                            color: 'var(--color-forest)',
                            textDecoration: 'underline'
                          }}
                          title="Call directly"
                        >
                          {contact.phone}
                        </a>
                      </div>

                      {contact.notes && (
                        <p
                          style={{
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--color-charcoal-muted)',
                            margin: '0.35rem 0 0.75rem 0'
                          }}
                        >
                          {contact.notes}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: '0.5rem'
                      }}
                    >
                      <a
                        href={`tel:${contact.phone}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <PhoneIcon size={12} />
                        <span>Call</span>
                      </a>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditContactModal(contact)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Edit contact"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setContactToDelete(contact);
                            setIsDeleteModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem', color: 'var(--color-terracotta)' }}
                          title="Delete contact"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* India National Emergency Hotlines Directory */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-forest)', margin: 0 }}>
                  Preloaded India Emergency Helplines
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.2rem' }}>
                  Universal government helplines operational 24/7 across all states and Union Territories in India.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 'var(--space-3)'
                }}
              >
                {DEFAULT_INDIA_HOTLINES.map((hotline) => (
                  <div
                    key={hotline.number}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest)' }}>
                        {hotline.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.15rem' }}>
                        {hotline.purpose}
                      </div>
                    </div>

                    <a
                      href={`tel:${hotline.number}`}
                      className="btn btn-sm"
                      style={{
                        backgroundColor:
                          hotline.priority === 'high' ? 'var(--color-terracotta)' : 'var(--color-forest)',
                        color: '#FFFFFF',
                        flexShrink: 0,
                        padding: '0.35rem 0.75rem',
                        fontWeight: 700
                      }}
                      title={`Dial ${hotline.number}`}
                    >
                      <PhoneIcon size={12} />
                      <span>{hotline.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: PERSONAL SAFETY CHECKLIST
            ===================================================================== */}
        {activeTab === 'checklist' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-forest)', margin: 0 }}>
                  Essential Solo Travel Preparation Checklist
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.2rem' }}>
                  Tick off vital items prior to departure. Progress is automatically saved to your browser.
                </p>
              </div>

              <button
                onClick={() => setIsResetChecklistModalOpen(true)}
                className="btn btn-secondary btn-sm"
                title="Reset all checklist items"
              >
                <RefreshCwIcon size={14} />
                <span>Reset Checklist</span>
              </button>
            </div>

            {/* Checklist Progress Meter */}
            <Card variant="default" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600
                }}
              >
                <span style={{ color: 'var(--color-forest)' }}>
                  Readiness Progress: {completedChecklistCount} of {checklist.length} Essentials Verified
                </span>
                <span style={{ color: checklistPercentage === 100 ? 'var(--color-success)' : 'var(--color-terracotta)' }}>
                  {checklistPercentage}% Ready
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${checklistPercentage}%`,
                    backgroundColor:
                      checklistPercentage === 100 ? 'var(--color-success)' : 'var(--color-forest)'
                  }}
                />
              </div>
              {checklistPercentage === 100 && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    fontSize: 'var(--text-2xs)',
                    color: 'var(--color-forest)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckIcon size={14} />
                  <span>All core safety preparations verified for solo travel.</span>
                </div>
              )}
            </Card>

            {/* Checklist Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={`checklist-item ${item.checked ? 'is-completed' : ''}`}
                >
                  <div className="checklist-checkbox">
                    {item.checked && <CheckIcon size={14} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: item.checked ? 'var(--color-forest)' : 'var(--color-charcoal)',
                          textDecoration: item.checked ? 'line-through' : 'none'
                        }}
                      >
                        {item.label}
                      </span>
                      {item.category && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--color-ivory-light)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--color-charcoal-muted)'
                          }}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: SAVED TRIP OVERVIEW (Integrated with Safety Planner)
            ===================================================================== */}
        {activeTab === 'trips' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-forest)', margin: 0 }}>
                  Saved Travel Plans
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.2rem' }}>
                  Travel plans synchronized with your Safety Planner in local browser storage.
                </p>
              </div>

              <button onClick={handleNavigateToPlanner} className="btn btn-secondary btn-sm">
                <ExternalLinkIcon size={14} />
                <span>Open Safety Planner</span>
              </button>
            </div>

            {savedPlans.length === 0 ? (
              <Card
                variant="default"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-8) var(--space-4)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ color: 'var(--color-charcoal-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <CalendarIcon size={32} />
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  No saved travel plans found
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
                  Create your first backup travel plan (Plan B) with contingency stops, accommodation details, and safe
                  haven checkpoints in the Safety Planner.
                </p>
                <button onClick={handleNavigateToPlanner} className="btn btn-primary btn-sm">
                  <span>Create Travel Plan</span>
                </button>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {savedPlans.map((plan) => {
                  const isActive = activePlan && activePlan.id === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      variant={isActive ? 'editorial' : 'default'}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: isActive ? 'var(--color-forest)' : 'var(--border-subtle)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', margin: 0 }}>
                            {plan.startingLocation ? `${plan.startingLocation} → ` : ''}
                            {plan.destination}
                          </h3>
                          {isActive && <Badge variant="forest">Active Itinerary</Badge>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-charcoal-muted)', fontSize: 'var(--text-xs)' }}>
                          {getTransportIcon(plan.transportMethod)}
                          <span>{plan.transportMethod || 'Train'}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.75rem',
                          margin: '0.75rem 0',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-charcoal)'
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--color-charcoal-muted)', display: 'block', fontSize: 'var(--text-2xs)' }}>
                            DATES
                          </strong>
                          <span>
                            {plan.departureDate ? `Departure: ${plan.departureDate}` : 'Date not set'}
                            {plan.returnDate ? ` &bull; Return: ${plan.returnDate}` : ''}
                          </span>
                        </div>

                        {plan.accommodation && (
                          <div>
                            <strong style={{ color: 'var(--color-charcoal-muted)', display: 'block', fontSize: 'var(--text-2xs)' }}>
                              ACCOMMODATION
                            </strong>
                            <span>{plan.accommodation}</span>
                          </div>
                        )}

                        {plan.emergencyContactPhone && (
                          <div>
                            <strong style={{ color: 'var(--color-charcoal-muted)', display: 'block', fontSize: 'var(--text-2xs)' }}>
                              PRIMARY EMERGENCY PHONE
                            </strong>
                            <a href={`tel:${plan.emergencyContactPhone}`} style={{ color: 'var(--color-forest)', textDecoration: 'underline' }}>
                              {plan.emergencyContactPhone}
                            </a>
                            {plan.emergencyContactName ? ` (${plan.emergencyContactName})` : ''}
                          </div>
                        )}
                      </div>

                      {plan.notes && (
                        <div
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--color-ivory-light)',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: 'var(--text-2xs)',
                            color: 'var(--color-charcoal-muted)',
                            marginBottom: '0.75rem'
                          }}
                        >
                          <strong>Safety Notes:</strong> {plan.notes}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: 'var(--text-2xs)',
                          color: 'var(--color-charcoal-muted)'
                        }}
                      >
                        <span>
                          Checklist Items: {Array.isArray(plan.checklist) ? plan.checklist.filter((i) => i.completed).length : 0}/
                          {Array.isArray(plan.checklist) ? plan.checklist.length : 0}
                        </span>

                        <button
                          onClick={handleNavigateToPlanner}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem' }}
                        >
                          <span>Manage Plan in Planner &rarr;</span>
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 4: EMERGENCY SUMMARY (Screen Preview & Print Trigger)
            ===================================================================== */}
        {activeTab === 'summary' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-forest)', margin: 0 }}>
                  Emergency Travel Safety Summary
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.2rem' }}>
                  A consolidated, printable safety brief combining your active travel itinerary, personal contacts,
                  and national helplines.
                </p>
              </div>

              <button onClick={handlePrintSummary} className="btn btn-primary btn-sm">
                <PrinterIcon size={14} />
                <span>Print Safety Brief / Save PDF</span>
              </button>
            </div>

            {/* Document Preview Card */}
            <Card
              variant="default"
              style={{
                backgroundColor: '#FFFFFF',
                padding: 'var(--space-6)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {/* Document Header */}
              <div
                style={{
                  borderBottom: '2px solid var(--color-forest)',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                    EXIT PLAN AI &bull; Travel Safety Document
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-forest)', margin: '0.2rem 0' }}>
                    Solo Travel Safety & Emergency Sheet
                  </h3>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)' }}>
                    Pre-Trip Verification &bull; Saved on Device
                  </div>
                </div>

                <Badge variant="sage">Offline Verified</Badge>
              </div>

              {/* Section 1: Active Itinerary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
                  1. Active Travel Itinerary
                </h4>
                {activePlan ? (
                  <div style={{ fontSize: 'var(--text-xs)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-charcoal-muted)', display: 'block' }}>Destination:</span>
                      <strong>{activePlan.destination}</strong>
                      {activePlan.startingLocation && (
                        <span style={{ color: 'var(--color-charcoal-muted)' }}> (from {activePlan.startingLocation})</span>
                      )}
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-charcoal-muted)', display: 'block' }}>Travel Dates:</span>
                      <strong>
                        {activePlan.departureDate || 'N/A'} {activePlan.returnDate ? `to ${activePlan.returnDate}` : ''}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-charcoal-muted)', display: 'block' }}>Transport Mode:</span>
                      <strong>{activePlan.transportMethod || 'Train'}</strong>
                    </div>
                    {activePlan.accommodation && (
                      <div>
                        <span style={{ color: 'var(--color-charcoal-muted)', display: 'block' }}>Accommodation:</span>
                        <strong>{activePlan.accommodation}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', fontStyle: 'italic', margin: 0 }}>
                    No active travel plan selected. (Create or designate a plan in Safety Planner)
                  </p>
                )}
              </div>

              {/* Section 2: Personal Contacts */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
                  2. Trusted Personal Contacts ({contacts.length})
                </h4>
                {contacts.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.65rem' }}>
                    {contacts.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: '0.6rem 0.85rem',
                          backgroundColor: 'var(--color-ivory-light)',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{c.name}</div>
                        <div style={{ color: 'var(--color-charcoal-muted)', fontSize: 'var(--text-2xs)' }}>
                          {c.relationship}
                        </div>
                        <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{c.phone}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', fontStyle: 'italic', margin: 0 }}>
                    No personal contacts added. Go to the Emergency Contacts tab to add trusted friends/family.
                  </p>
                )}
              </div>

              {/* Section 3: Essential National Helplines */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
                  3. Key India Emergency Hotlines
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', fontSize: 'var(--text-xs)' }}>
                  <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-alert-bg)', borderRadius: 'var(--radius-xs)' }}>
                    <strong>112</strong> &bull; All-India Emergency
                  </div>
                  <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-alert-bg)', borderRadius: 'var(--radius-xs)' }}>
                    <strong>1091</strong> &bull; Women Police Helpline
                  </div>
                  <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-ivory-light)', borderRadius: 'var(--radius-xs)' }}>
                    <strong>139</strong> &bull; Railway Passenger Security
                  </div>
                  <div style={{ padding: '0.45rem', backgroundColor: 'var(--color-ivory-light)', borderRadius: 'var(--radius-xs)' }}>
                    <strong>1930</strong> &bull; Cyber Crime Helpline
                  </div>
                </div>
              </div>

              {/* Section 4: Checklist Status */}
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
                  4. Safety Preparation Readiness
                </h4>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)' }}>
                  <strong>{completedChecklistCount} of {checklist.length} items verified</strong> ({checklistPercentage}%).
                  {checklistPercentage < 100 && (
                    <span style={{ color: 'var(--color-terracotta)', marginLeft: '0.4rem' }}>
                      Review uncompleted checklist items prior to departure.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =====================================================================
            MODAL 1: Add / Edit Emergency Contact
            ===================================================================== */}
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          kicker="Personal Emergency Network"
          title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          footer={
            <>
              <button onClick={() => setIsContactModalOpen(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleSaveContact} className="btn btn-primary btn-sm">
                {editingContact ? 'Update Contact' : 'Save Contact'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveContact}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: 'var(--color-terracotta)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                  placeholder="e.g. Ananya Rao"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${contactFormErrors.name ? 'var(--color-terracotta)' : 'var(--border-medium)'}`,
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
                {contactFormErrors.name && (
                  <p style={{ color: 'var(--color-terracotta)', fontSize: 'var(--text-2xs)', marginTop: '0.25rem' }}>
                    {contactFormErrors.name}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Relationship <span style={{ color: 'var(--color-terracotta)' }}>*</span>
                </label>
                <select
                  value={contactFormData.relationship}
                  onChange={(e) => setContactFormData({ ...contactFormData, relationship: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Family / Parent">Family / Parent</option>
                  <option value="Sibling (Sister / Brother)">Sibling (Sister / Brother)</option>
                  <option value="Partner / Spouse">Partner / Spouse</option>
                  <option value="Close Friend">Close Friend</option>
                  <option value="Local Host / Guide">Local Host / Guide</option>
                  <option value="Colleague / Work">Colleague / Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Phone Number <span style={{ color: 'var(--color-terracotta)' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={contactFormData.phone}
                  onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${contactFormErrors.phone ? 'var(--color-terracotta)' : 'var(--border-medium)'}`,
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
                {contactFormErrors.phone && (
                  <p style={{ color: 'var(--color-terracotta)', fontSize: 'var(--text-2xs)', marginTop: '0.25rem' }}>
                    {contactFormErrors.phone}
                  </p>
                )}
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Include country code (e.g. +91) for Indian or international numbers.
                </span>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={contactFormData.notes}
                  onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                  placeholder="e.g. Lives in Bengaluru, has spare house keys"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {contactFormErrors.submit && (
                <p style={{ color: 'var(--color-terracotta)', fontSize: 'var(--text-xs)' }}>
                  {contactFormErrors.submit}
                </p>
              )}
            </div>
          </form>
        </Modal>

        {/* =====================================================================
            MODAL 2: Delete Contact Confirmation
            ===================================================================== */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          kicker="Remove Contact"
          title="Delete Emergency Contact?"
          footer={
            <>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteContact}
                className="btn btn-sm"
                style={{ backgroundColor: 'var(--color-terracotta)', color: '#FFFFFF' }}
              >
                Delete Contact
              </button>
            </>
          }
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to remove <strong>{contactToDelete?.name}</strong> ({contactToDelete?.phone}) from your
            Safety Vault? This contact will no longer appear on your emergency summary sheet.
          </p>
        </Modal>

        {/* =====================================================================
            MODAL 3: Reset Checklist Confirmation
            ===================================================================== */}
        <Modal
          isOpen={isResetChecklistModalOpen}
          onClose={() => setIsResetChecklistModalOpen(false)}
          kicker="Checklist Management"
          title="Reset Preparation Checklist?"
          footer={
            <>
              <button onClick={() => setIsResetChecklistModalOpen(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleConfirmResetChecklist} className="btn btn-primary btn-sm">
                Reset All Items
              </button>
            </>
          }
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', lineHeight: 1.5, margin: 0 }}>
            This will uncheck all 10 safety preparation items so you can start fresh for a new journey. Your saved
            travel plans and emergency contacts will not be affected.
          </p>
        </Modal>
      </div>
    </div>
  );
};
