import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ShieldIcon,
  CompassIcon,
  CalendarIcon,
  CheckIcon,
  AlertIcon,
  PhoneIcon,
  PrinterIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  MapPinIcon,
  InfoIcon,
  TrainIcon,
  BusIcon,
  PlaneIcon,
  CarIcon,
  FileTextIcon
} from '../components/common/Icons';
import {
  getStoredPlans,
  getActivePlan,
  getActivePlanId,
  setActivePlanId,
  savePlan,
  deletePlan,
  updatePlanChecklist,
  generatePlanId,
  DEFAULT_INDIA_HOTLINES
} from '../services/storage';

export const ExitPlan = () => {
  // State for views: 'create' | 'view' | 'list'
  const [viewMode, setViewMode] = useState('create');
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  // Storage error & feedback state
  const [storageError, setStorageError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Delete confirmation modal state
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const initialFormState = {
    startingLocation: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    transportMethod: 'Train',
    accommodation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Initialize and retrieve stored plans on mount
  useEffect(() => {
    try {
      const plans = getStoredPlans();
      setSavedPlans(plans);

      const active = getActivePlan();
      if (active) {
        setActivePlan(active);
        // If a saved plan exists, show it immediately so the user can see their plan
        setViewMode('view');
      } else {
        setActivePlan(null);
        setViewMode('create');
      }
    } catch (e) {
      console.error('Failed to initialize travel plans from LocalStorage:', e);
      setStorageError('Unable to access browser storage. Please verify cookies/local storage permissions.');
    }
  }, []);

  // Helper to get transport icon
  const getTransportIcon = (method) => {
    switch (method) {
      case 'Train':
        return TrainIcon;
      case 'Bus':
        return BusIcon;
      case 'Flight':
        return PlaneIcon;
      case 'Car':
        return CarIcon;
      default:
        return CompassIcon;
    }
  };

  // Checklist generator based on user trip inputs
  const generateChecklist = (data) => {
    const { startingLocation, destination, transportMethod, accommodation, emergencyContactName, emergencyContactPhone } = data;

    // Transport-specific backup checklist item
    let transportItem = {
      id: 'item-transport-backup',
      category: 'Transport Backup',
      title: 'Transport Backup & Emergency Support',
      details: 'Note emergency transit contact and verified alternate routes.',
      completed: false
    };

    if (transportMethod === 'Train') {
      transportItem.details = `Save Railway Protection Force (RPF 139) on phone. Verify PNR on official RailMadad portal. Identify secondary express trains running between ${startingLocation || 'origin'} and ${destination || 'destination'}.`;
    } else if (transportMethod === 'Bus') {
      transportItem.details = `Verify daytime boarding stand and drop-off points. Keep customer support number of state transport or bus operator saved offline.`;
    } else if (transportMethod === 'Flight') {
      transportItem.details = `Verify terminal numbers and airport 24/7 executive waiting lounge location. Save airline helpline for weather or connection delays.`;
    } else if (transportMethod === 'Car') {
      transportItem.details = `Verify vehicle license plate, driver registration, and photo ID prior to boarding. Pre-enable live GPS trip-sharing with trusted contacts.`;
    } else {
      transportItem.details = `Inspect route map, identify 24-hour public fuel/toll stops, and locate highway patrol outposts along the corridor.`;
    }

    return [
      {
        id: 'item-id-docs',
        category: 'Documents',
        title: 'Essential Identification & Physical Copies',
        details: 'Carry original government ID (Aadhaar / Voter ID / Passport) plus laminated photocopies packed in a separate inner bag pocket.',
        completed: false
      },
      {
        id: 'item-offline-docs',
        category: 'Documents',
        title: 'Offline Digital Documents Vault',
        details: 'Store offline digital copies of tickets, hotel vouchers, and ID in Digilocker or encrypted local phone storage.',
        completed: false
      },
      {
        id: 'item-emergency-hotlines',
        category: 'Emergency',
        title: 'India Safety Helplines Pre-Programmed',
        details: 'Pre-program National Emergency (112) and Women Helpline (1091) on speed dial; write them on physical paper kept in your wallet.',
        completed: false
      },
      {
        id: 'item-emergency-contact',
        category: 'Emergency',
        title: emergencyContactName
          ? `Itinerary Shared with ${emergencyContactName}`
          : 'Emergency Itinerary Shared with Trusted Contact',
        details: emergencyContactName
          ? `Transmit full trip details, train/flight numbers, and hotel address to ${emergencyContactName}${emergencyContactPhone ? ` (${emergencyContactPhone})` : ''}.`
          : 'Send your full schedule, transit numbers, and hotel contact details to a trusted friend or family member.',
        completed: false
      },
      {
        id: 'item-power-bank',
        category: 'Power & Tech',
        title: 'Phone Battery & Backup Power Bank',
        details: 'Ensure phone is 100% charged before departure. Pack a 10,000+ mAh power bank and charging cable in your personal handbag (not checked luggage).',
        completed: false
      },
      transportItem,
      {
        id: 'item-stay-backup',
        category: 'Accommodation',
        title: accommodation
          ? `24-Hour Check-in Confirmed at ${accommodation}`
          : 'Accommodation Backup & Late Arrival Policy',
        details: accommodation
          ? `Confirm late check-in procedure with ${accommodation}. Note a verified backup 24/7 hotel within 2 km of ${destination || 'destination'}.`
          : `Verify late arrival policy and save contact details for a verified 24-hour staffed backup hotel in ${destination || 'destination'}.`,
        completed: false
      },
      {
        id: 'item-checkin-milestones',
        category: 'Personal Safety',
        title: 'Scheduled Arrival Check-in Milestones',
        details: `Set calendar alarms to text your trusted contact at 3 checkpoints: boarding transit, midpoint of journey, and upon safe hotel check-in.`,
        completed: false
      },
      {
        id: 'item-belongings-security',
        category: 'Belongings',
        title: 'Protection of Money & Critical Belongings',
        details: 'Keep payment cards, emergency cash, and phone in an anti-theft cross-body pouch worn close to your chest. Split backup cards into a secondary bag.',
        completed: false
      },
      {
        id: 'item-offline-maps',
        category: 'Offline Access',
        title: `Offline Map & Address of ${destination || 'Destination'}`,
        details: `Download offline Google Maps area for ${destination || 'destination'}. Write the hotel name and destination address in regional script/English for local auto drivers.`,
        completed: false
      }
    ];
  };

  // Form field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error upon modification
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!formData.startingLocation.trim()) {
      errors.startingLocation = 'Starting location is required';
    }

    if (!formData.destination.trim()) {
      errors.destination = 'Destination is required';
    }

    if (!formData.departureDate) {
      errors.departureDate = 'Departure date is required';
    }

    if (!formData.returnDate) {
      errors.returnDate = 'Return date is required';
    }

    if (formData.departureDate && formData.returnDate) {
      const dep = new Date(formData.departureDate);
      const ret = new Date(formData.returnDate);
      if (ret < dep) {
        errors.returnDate = 'Return date cannot be earlier than departure date';
      }
    }

    if (!formData.transportMethod) {
      errors.transportMethod = 'Please select a primary transport method';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate / Save Plan
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const planId = isEditing && editingPlanId ? editingPlanId : generatePlanId();
      let checklist;
      let createdAt = new Date().toISOString();

      if (isEditing && editingPlanId) {
        const existing = savedPlans.find((p) => p.id === editingPlanId);
        if (existing) {
          createdAt = existing.createdAt || createdAt;
          const freshChecklist = generateChecklist(formData);
          checklist = freshChecklist.map((item) => {
            const prevMatch = existing.checklist?.find((c) => c.id === item.id);
            return prevMatch ? { ...item, completed: prevMatch.completed } : item;
          });
        } else {
          checklist = generateChecklist(formData);
        }
      } else {
        checklist = generateChecklist(formData);
      }

      const planToSave = {
        ...formData,
        id: planId,
        checklist,
        createdAt
      };

      const result = savePlan(planToSave);

      if (!result.success) {
        setStorageError(`Failed to save plan to browser storage: ${result.error || 'Quota exceeded'}`);
        return;
      }

      setSavedPlans(result.plans);
      setActivePlan(result.savedPlan);
      setActivePlanId(result.savedPlan.id);
      setViewMode('view');
      setIsEditing(false);
      setEditingPlanId(null);
      setStorageError(null);

      const msg = isEditing
        ? `Safety plan for ${result.savedPlan.destination} updated and saved successfully.`
        : `Safety plan for ${result.savedPlan.destination} generated and saved to your browser.`;
      setSaveSuccessMessage(msg);
      setTimeout(() => setSaveSuccessMessage(''), 4000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setStorageError('An unexpected error occurred while saving the plan.');
    }
  };

  // Toggle checklist item with immediate persistence
  const handleToggleChecklist = (itemId) => {
    if (!activePlan || !activePlan.id) return;

    const updatedChecklist = activePlan.checklist.map((item) => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    const updatedPlan = { ...activePlan, checklist: updatedChecklist };
    setActivePlan(updatedPlan);

    // Persist immediately to storage
    const result = updatePlanChecklist(activePlan.id, updatedChecklist);
    if (result.success) {
      setSavedPlans(result.plans);
    } else {
      console.warn('Could not persist checklist change:', result.error);
    }
  };

  // Open existing plan from list
  const handleOpenPlan = (plan) => {
    if (!plan) return;
    setActivePlan(plan);
    setActivePlanId(plan.id);
    setViewMode('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Edit existing plan
  const handleStartEdit = (plan) => {
    if (!plan) return;
    setFormData({
      startingLocation: plan.startingLocation || '',
      destination: plan.destination || '',
      departureDate: plan.departureDate || '',
      returnDate: plan.returnDate || '',
      transportMethod: plan.transportMethod || 'Train',
      accommodation: plan.accommodation || '',
      emergencyContactName: plan.emergencyContactName || '',
      emergencyContactPhone: plan.emergencyContactPhone || '',
      notes: plan.notes || ''
    });
    setEditingPlanId(plan.id);
    setIsEditing(true);
    setFormErrors({});
    setViewMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPlanId(null);
    setFormData(initialFormState);
    setFormErrors({});
    if (activePlan) {
      setViewMode('view');
    } else if (savedPlans.length > 0) {
      setViewMode('list');
    }
  };

  // Delete plan trigger
  const handlePromptDelete = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete plan
  const handleConfirmDelete = () => {
    if (!planToDelete || !planToDelete.id) return;

    const result = deletePlan(planToDelete.id);
    setSavedPlans(result.plans);

    if (activePlan?.id === planToDelete.id) {
      setActivePlan(result.nextActivePlan);
      if (result.nextActivePlan) {
        setActivePlanId(result.nextActivePlan.id);
        setViewMode('view');
      } else {
        setActivePlanId(null);
        setViewMode('create');
      }
    }

    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
    setSaveSuccessMessage('Safety plan deleted from browser storage.');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Print safety plan
  const handlePrint = () => {
    window.print();
  };

  // Checklist completion stats
  const completedCount = activePlan?.checklist?.filter((item) => item.completed).length || 0;
  const totalCount = activePlan?.checklist?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Header and Mission Statement */}
      <div className="section-intro no-print">
        <div className="kicker">Stage 1 &bull; Safety Planner</div>
        <h1>Personal Safety Planner & Backup Engine</h1>
        <p>
          Formulate complete contingency itineraries, actionable backup plans, and verified safety checklists
          tailored for solo female travel across India. Prepare before departure so you are never out of options.
        </p>
      </div>

      {/* Storage Error Warning Banner */}
      {storageError && (
        <div
          className="no-print"
          style={{
            backgroundColor: 'var(--color-alert-bg)',
            border: '1.5px solid var(--color-terracotta)',
            color: 'var(--color-terracotta-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: 'var(--space-6)'
          }}
        >
          <AlertIcon size={20} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{storageError}</span>
        </div>
      )}

      {/* Local Storage Disclaimer Banner */}
      <div
        className="no-print"
        style={{
          backgroundColor: 'var(--color-ivory-light)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ color: 'var(--color-forest)', flexShrink: 0 }}>
          <InfoIcon size={20} />
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.5 }}>
          <strong>Private Local Storage:</strong> All safety plans and checklist milestones are stored strictly in this browser.
          Your personal travel details are never uploaded to remote servers and are not synced across other devices.
        </p>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div
          className="no-print"
          style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-forest)',
            color: 'var(--color-forest)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: 'var(--space-6)'
          }}
        >
          <CheckIcon size={18} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Navigation Segments / Tabs */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-medium)',
          paddingBottom: '0.5rem',
          marginBottom: 'var(--space-8)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleCancelEdit();
              setViewMode('create');
            }}
            className={`btn btn-sm ${viewMode === 'create' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <PlusIcon size={15} />
            <span>{isEditing ? 'Editing Plan' : 'New Safety Plan'}</span>
          </button>

          {activePlan && (
            <button
              type="button"
              onClick={() => setViewMode('view')}
              className={`btn btn-sm ${viewMode === 'view' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FileTextIcon size={15} />
              <span>Active Plan: {activePlan.destination || 'Current Trip'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <CompassIcon size={15} />
            <span>Saved Plans ({savedPlans.length})</span>
          </button>
        </div>

        {viewMode === 'view' && activePlan && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" icon={PrinterIcon} onClick={handlePrint}>
              Print Plan
            </Button>
            <Button variant="ghost" size="sm" icon={EditIcon} onClick={() => handleStartEdit(activePlan)}>
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: CREATE / EDIT TRIP DETAILS FORM
         ========================================================================= */}
      {viewMode === 'create' && (
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <Card
            variant="editorial"
            kicker={isEditing ? 'Modify Plan' : 'Itinerary & Risk Parameters'}
            title={isEditing ? `Editing Safety Plan for ${formData.destination || 'Trip'}` : 'Trip Details Form'}
            subtitle="Enter your journey details to generate customized safety checklists, transport backup routes, and fallback protocols."
          >
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid-2">
                {/* Starting Location */}
                <div className="form-group">
                  <label htmlFor="startingLocation" className="form-label">
                    <span>Starting Location<span className="required-indicator">*</span></span>
                  </label>
                  <input
                    id="startingLocation"
                    name="startingLocation"
                    type="text"
                    placeholder="e.g. New Delhi, Bengaluru"
                    value={formData.startingLocation}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.startingLocation ? 'input-invalid' : ''}`}
                    aria-invalid={Boolean(formErrors.startingLocation)}
                    aria-describedby={formErrors.startingLocation ? 'startingLocation-error' : undefined}
                  />
                  {formErrors.startingLocation && (
                    <div id="startingLocation-error" className="form-error">
                      <AlertIcon size={13} />
                      <span>{formErrors.startingLocation}</span>
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">
                    <span>Destination<span className="required-indicator">*</span></span>
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="e.g. Manali, Jaipur, Kochi"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.destination ? 'input-invalid' : ''}`}
                    aria-invalid={Boolean(formErrors.destination)}
                    aria-describedby={formErrors.destination ? 'destination-error' : undefined}
                  />
                  {formErrors.destination && (
                    <div id="destination-error" className="form-error">
                      <AlertIcon size={13} />
                      <span>{formErrors.destination}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-3">
                {/* Departure Date */}
                <div className="form-group">
                  <label htmlFor="departureDate" className="form-label">
                    <span>Departure Date<span className="required-indicator">*</span></span>
                  </label>
                  <input
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.departureDate ? 'input-invalid' : ''}`}
                    aria-invalid={Boolean(formErrors.departureDate)}
                    aria-describedby={formErrors.departureDate ? 'departureDate-error' : undefined}
                  />
                  {formErrors.departureDate && (
                    <div id="departureDate-error" className="form-error">
                      <AlertIcon size={13} />
                      <span>{formErrors.departureDate}</span>
                    </div>
                  )}
                </div>

                {/* Return Date */}
                <div className="form-group">
                  <label htmlFor="returnDate" className="form-label">
                    <span>Return Date<span className="required-indicator">*</span></span>
                  </label>
                  <input
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.returnDate ? 'input-invalid' : ''}`}
                    aria-invalid={Boolean(formErrors.returnDate)}
                    aria-describedby={formErrors.returnDate ? 'returnDate-error' : undefined}
                  />
                  {formErrors.returnDate && (
                    <div id="returnDate-error" className="form-error">
                      <AlertIcon size={13} />
                      <span>{formErrors.returnDate}</span>
                    </div>
                  )}
                </div>

                {/* Transport Method */}
                <div className="form-group">
                  <label htmlFor="transportMethod" className="form-label">
                    <span>Transport Method<span className="required-indicator">*</span></span>
                  </label>
                  <select
                    id="transportMethod"
                    name="transportMethod"
                    value={formData.transportMethod}
                    onChange={handleInputChange}
                    className={`form-select ${formErrors.transportMethod ? 'input-invalid' : ''}`}
                  >
                    <option value="Train">Train (IRCTC / Indian Railways)</option>
                    <option value="Bus">Interstate Bus (State / Private)</option>
                    <option value="Flight">Flight (Domestic)</option>
                    <option value="Car">Car / Cab / Self-Drive</option>
                    <option value="Other">Other / Multi-modal Transit</option>
                  </select>
                  {formErrors.transportMethod && (
                    <div className="form-error">
                      <AlertIcon size={13} />
                      <span>{formErrors.transportMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Accommodation */}
              <div className="form-group">
                <label htmlFor="accommodation" className="form-label">
                  <span>Accommodation Name & Address</span>
                  <span className="optional-indicator">Optional</span>
                </label>
                <input
                  id="accommodation"
                  name="accommodation"
                  type="text"
                  placeholder="e.g. Zostel Old Manali, The Grand Heritage Hotel, Jaipur"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <span className="form-help">Helps customize late arrival and verified safe haven checkpoints.</span>
              </div>

              <div className="grid-2">
                {/* Emergency Contact Name */}
                <div className="form-group">
                  <label htmlFor="emergencyContactName" className="form-label">
                    <span>Emergency Contact Name</span>
                    <span className="optional-indicator">Optional</span>
                  </label>
                  <input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    placeholder="e.g. Priya Sharma (Sister)"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div className="form-group">
                  <label htmlFor="emergencyContactPhone" className="form-label">
                    <span>Emergency Contact Phone</span>
                    <span className="optional-indicator">Optional</span>
                  </label>
                  <input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  <span>Additional Travel Notes / Known Concerns</span>
                  <span className="optional-indicator">Optional</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  placeholder="e.g. Late night train arrival at 11:30 PM; traveling alone through mountain terrain; need offline contacts."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                {isEditing && (
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancel Edit
                  </Button>
                )}
                <Button type="submit" variant="primary" icon={CompassIcon}>
                  {isEditing ? 'Save Changes to Plan' : 'Save & Generate Safety Plan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ACTIVE PLAN DETAILS, CHECKLIST & PLAN B GUIDANCE
         ========================================================================= */}
      {viewMode === 'view' && activePlan && (
        <div id="printable-plan">
          {/* Printable Document Title (Only visible in Print) */}
          <div className="print-only print-doc-header" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #183D32', paddingBottom: '0.75rem' }}>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#183D32' }}>EXIT PLAN AI &bull; Travel Safety & Contingency Briefing</div>
            <div style={{ fontSize: '10pt', color: '#555555' }}>
              Designed for Solo Female Travellers &bull; Printed Document Backup &bull; All-India Helpline: 112 / 1091
            </div>
          </div>

          {/* Trip Summary Card */}
          <Card
            className="trip-summary-card"
            variant="editorial"
            kicker="Active Travel Plan"
            title={`${activePlan.startingLocation} → ${activePlan.destination}`}
            subtitle={`${activePlan.departureDate} to ${activePlan.returnDate} • via ${activePlan.transportMethod}`}
            headerAction={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Badge variant="forest">{activePlan.transportMethod}</Badge>
                <Badge variant={progressPercent === 100 ? 'sage' : 'terracotta'}>
                  {progressPercent}% Prepared
                </Badge>
                <Badge variant="sage" icon={CheckIcon} className="no-print">
                  Saved
                </Badge>
              </div>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--color-ivory-light)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', color: 'var(--color-charcoal-subtle)', fontWeight: 700 }}>
                  Accommodation
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest)', marginTop: '2px' }}>
                  {activePlan.accommodation || 'Not specified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', color: 'var(--color-charcoal-subtle)', fontWeight: 700 }}>
                  Emergency Contact
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest)', marginTop: '2px' }}>
                  {activePlan.emergencyContactName ? (
                    <span>
                      {activePlan.emergencyContactName} {activePlan.emergencyContactPhone && `(${activePlan.emergencyContactPhone})`}
                    </span>
                  ) : (
                    'Not specified'
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', color: 'var(--color-charcoal-subtle)', fontWeight: 700 }}>
                  National Helplines
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest)', marginTop: '2px' }}>
                  112 (National) &bull; 1091 (Women)
                </div>
              </div>
            </div>

            {activePlan.notes && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', fontStyle: 'italic', marginBottom: '1rem' }}>
                <strong>Personal Notes:</strong> {activePlan.notes}
              </div>
            )}

            {/* Checklist Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-forest)' }}>
                  Checklist Progress: {completedCount} of {totalCount} completed
                </span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                  {progressPercent}%
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </Card>

          <div className="no-print" style={{ height: 'var(--space-6)' }}></div>

          {/* Section 2: Generated Safety Checklist */}
          <div className="print-section-checklist" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="print-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div className="kicker">Preparation Layer</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.45rem' }}>
                  Tailored Safety Checklist
                </h2>
              </div>
              <span className="no-print" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)' }}>
                Click items to toggle completion • Saved automatically
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activePlan.checklist?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`checklist-item ${item.completed ? 'is-completed' : ''}`}
                  role="checkbox"
                  aria-checked={item.completed}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleChecklist(item.id);
                    }
                  }}
                >
                  <div className="checklist-checkbox">
                    {item.completed && <CheckIcon size={14} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: item.completed ? 'var(--color-charcoal-muted)' : 'var(--color-forest)',
                          textDecoration: 'none'
                        }}
                      >
                        {item.title}
                      </span>
                      <Badge variant={item.completed ? 'sage' : 'outline'} className="no-print">
                        {item.category}
                      </Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.5 }}>
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Plan B Fallback Guidance */}
          <div className="plan-b-section" style={{ marginBottom: 'var(--space-10)' }}>
            <div className="print-section-header" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="kicker" style={{ color: 'var(--color-terracotta)' }}>Contingency Protocols</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.45rem' }}>
                Plan B Fallback Guidance
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal-muted)', margin: 0 }}>
                Practical, step-by-step contingency actions for when unexpected transit disruptions or safety concerns occur.
              </p>
            </div>

            <div className="grid-2 contingency-grid">
              {/* Scenario 1: Transport Cancellation */}
              <Card
                className="contingency-card"
                variant="terracotta"
                kicker="Scenario 1"
                title="Cancelled or Severely Delayed Transport"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  <p><strong>1. Secure Location:</strong> Remain within official station waiting halls (such as IRCTC Upper Class / Executive Waiting Rooms or airport terminal lounges). Avoid waiting outside station gates or near unverified tout areas.</p>
                  <p><strong>2. Official Counter:</strong> Approach the official station master or airline help desk directly. In Indian Railways, request a Ticket Deposit Receipt (TDR) or alternate berth accommodation on the next outbound train.</p>
                  <p><strong>3. Never Accept Unmetered Private Cabs:</strong> Do not engage drivers outside transit hubs claiming all transport is cancelled. Use verified prepaid taxi booths or official state transport counters.</p>
                </div>
              </Card>

              {/* Scenario 2: Accommodation Cancellation */}
              <Card
                className="contingency-card"
                variant="editorial"
                kicker="Scenario 2"
                title="Accommodation Cancellation or Unsafe Check-in"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  <p><strong>1. Trust Your Instincts:</strong> If accommodation upon arrival is poorly illuminated, lacks verified staff, or differs substantially from booking photos, do not enter rooms or hand over your passport/ID without verified receipt.</p>
                  <p><strong>2. Immediate Retreat:</strong> Retreat calmly to a busy public area (major railway waiting lounge, 24-hour restaurant, or branded fuel station cafe).</p>
                  <p><strong>3. Verified Backup:</strong> Book a verified national chain hotel or government circuit house/guest house. If in acute distress at night, contact the Women Helpline at <strong>1091</strong> or <strong>181</strong> for local shelter guidance.</p>
                </div>
              </Card>

              {/* Scenario 3: Low Battery or Lost Connectivity */}
              <Card
                className="contingency-card"
                variant="default"
                kicker="Scenario 3"
                title="Low Battery or Lost Network Coverage"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  <p><strong>1. Power Conservation:</strong> Immediately engage Ultra Power Saving Mode and disable Bluetooth, background GPS, and non-essential apps.</p>
                  <p><strong>2. Station Charging:</strong> Locate official waiting room charging points or airport phone kiosks. Keep your power bank topped up during layovers.</p>
                  <p><strong>3. Physical Reference:</strong> Refer to your printed paper safety plan for key telephone numbers and pre-written destination directions in local language.</p>
                </div>
              </Card>

              {/* Scenario 4: Lost Documents or Wallet */}
              <Card
                className="contingency-card"
                variant="default"
                kicker="Scenario 4"
                title="Lost Documents, Money, or Phone"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.55 }}>
                  <p><strong>1. Freeze Accounts:</strong> Immediately call your bank’s toll-free helpline or use net banking via a trusted device to lock cards and disable UPI transfers.</p>
                  <p><strong>2. Police e-FIR:</strong> File a Missing Article Report at the nearest Government Railway Police (GRP) or local police station to obtain a stamped copy required for travel continuation.</p>
                  <p><strong>3. Identification Fallback:</strong> Present your secondary laminated physical photocopies or access Digilocker for legal verification across Indian checkpoints.</p>
                </div>
              </Card>
            </div>

            {/* Scenario 5: Feeling Unsafe While Travelling */}
            <div className="contingency-scenario-5" style={{ marginTop: 'var(--space-6)' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-alert-bg)',
                  border: '1.5px solid var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertIcon size={20} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.25rem', margin: 0 }}>
                    Scenario 5: Feeling Unsafe or Followed While Travelling
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.6 }}>
                  <div>
                    <strong>Immediate Maneuver:</strong> Move promptly toward authoritative figures: uniformed railway staff, ticket examiners (TTE), station managers, or female passengers in public waiting areas. Do not walk into unlit alleyways.
                  </div>
                  <div>
                    <strong>Instant Call:</strong> Dial <strong>112</strong> (National Emergency) or <strong>1091</strong> (Women Helpline). Speak loudly, clearly stating your location, transit vehicle number, and current position so bystanders take notice.
                  </div>
                  <div>
                    <strong>Railway Distress:</strong> In trains, immediately contact the Railway Protection Force (RPF) via <strong>139</strong> or pull the emergency chain if immediate physical danger presents itself.
                  </div>
                </div>
              </div>
            </div>

            {/* Official Verification Notice */}
            <div
              className="verification-reminder-box"
              style={{
                marginTop: 'var(--space-6)',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-ivory-light)',
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-charcoal-muted)',
                lineHeight: 1.5
              }}
            >
              <strong>Official Verification Reminder:</strong> Transport schedules, platform assignments, and accommodation policies must always be confirmed directly through official carriers (e.g. IRCTC, state transport portals, airlines) or licensed hoteliers. EXIT PLAN AI provides structured contingency safety guidance and does not invent live transport seats, hotel vacancies, or emergency service response times.
            </div>
          </div>

          {/* Action Row at Bottom */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--border-medium)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" icon={PrinterIcon} onClick={handlePrint}>
                Print Physical Safety Plan
              </Button>
              <Button variant="secondary" icon={CompassIcon} onClick={() => setViewMode('list')}>
                View Saved Plans ({savedPlans.length})
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" icon={EditIcon} onClick={() => handleStartEdit(activePlan)}>
                Edit Trip Details
              </Button>
              <Button
                variant="ghost"
                icon={TrashIcon}
                onClick={() => handlePromptDelete(activePlan)}
                style={{ color: 'var(--color-danger)' }}
              >
                Delete Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SAVED PLANS LIST
         ========================================================================= */}
      {viewMode === 'list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="kicker">Browser Storage</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', fontSize: '1.45rem', margin: 0 }}>
                Saved Safety Plans ({savedPlans.length})
              </h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={PlusIcon}
              onClick={() => {
                setIsEditing(false);
                setEditingPlanId(null);
                setFormData(initialFormState);
                setViewMode('create');
              }}
            >
              Create New Plan
            </Button>
          </div>

          {savedPlans.length === 0 ? (
            <Card variant="default">
              <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-forest)',
                    margin: '0 auto 1rem'
                  }}
                >
                  <CompassIcon size={24} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                  No Saved Travel Plans Found
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  You have not created any safety plans in this browser yet. Generate a plan to store offline checklists and contingency blueprints.
                </p>
                <Button variant="primary" icon={PlusIcon} onClick={() => setViewMode('create')}>
                  Create Your First Safety Plan
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid-2">
              {savedPlans.map((plan) => {
                const completed = plan.checklist?.filter((c) => c.completed).length || 0;
                const total = plan.checklist?.length || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                const TransportIconComponent = getTransportIcon(plan.transportMethod);
                const isCurrentActive = activePlan?.id === plan.id;

                return (
                  <Card
                    key={plan.id}
                    variant={isCurrentActive ? 'editorial' : 'default'}
                    kicker={plan.transportMethod}
                    title={`${plan.startingLocation} → ${plan.destination}`}
                    subtitle={`${plan.departureDate} to ${plan.returnDate}`}
                    headerAction={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isCurrentActive && <Badge variant="forest">Active</Badge>}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--color-forest-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-forest)'
                          }}
                        >
                          <TransportIconComponent size={16} />
                        </div>
                      </div>
                    }
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Badge variant={percent === 100 ? 'sage' : 'outline'}>
                            {completed}/{total} Ready ({percent}%)
                          </Badge>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <Button variant="secondary" size="sm" onClick={() => handleOpenPlan(plan)}>
                            Open Plan
                          </Button>
                          <Button variant="ghost" size="sm" icon={EditIcon} onClick={() => handleStartEdit(plan)} aria-label="Edit Plan" />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={TrashIcon}
                            onClick={() => handlePromptDelete(plan)}
                            aria-label="Delete Plan"
                            style={{ color: 'var(--color-danger)' }}
                          />
                        </div>
                      </div>
                    }
                  >
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', marginBottom: '0.5rem' }}>
                      {plan.accommodation && <div><strong>Stay:</strong> {plan.accommodation}</div>}
                      {plan.emergencyContactName && (
                        <div><strong>Contact:</strong> {plan.emergencyContactName}</div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        kicker="Confirm Action"
        title="Delete Travel Safety Plan?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Keep Plan
            </Button>
            <Button
              variant="terracotta"
              size="sm"
              icon={TrashIcon}
              onClick={handleConfirmDelete}
            >
              Delete Plan
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to delete the safety plan for{' '}
            <strong>{planToDelete?.destination || 'this destination'}</strong>?
          </p>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-alert-bg)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-charcoal)'
            }}
          >
            This action will permanently remove the saved itinerary, checklist progress, and contingency notes from your local browser storage.
          </div>
        </div>
      </Modal>
    </div>
  );
};
