import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Brain, Shield, FileText, ChevronDown, ChevronRight, CheckCircle, XCircle, Save, Database, List, HelpCircle, Info, Plus, Trash2, Target } from 'lucide-react';

const SUPABASE_URL = 'https://qpioxbmjmdecbbyawbfj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaW94Ym1qbWRlY2JieWF3YmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzE3MTgsImV4cCI6MjA4NDYwNzcxOH0.OaloqP5Z2tY999x3acEjjQgcafYBvzzAnxxxiAaTsjQ';

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  from(table) {
    const url = this.url;
    const key = this.key;
    
    return {
      select: async (columns = '*') => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}?select=${columns}`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
          });
          if (!response.ok) return { data: null, error: { message: await response.text() } };
          return { data: await response.json(), error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },
      insert: async (data) => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          });
          if (!response.ok) return { data: null, error: { message: await response.text() } };
          return { data: await response.json(), error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },
      update: (data) => ({
        eq: async (column, value) => {
          try {
            const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(data)
            });
            if (!response.ok) return { data: null, error: { message: await response.text() } };
            return { data: await response.json(), error: null };
          } catch (err) {
            return { data: null, error: { message: err.message } };
          }
        }
      })
    };
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-xs bg-gray-900 text-white rounded shadow-lg -top-2 left-6">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );
};

const SeverityInfo = ({ severity }) => {
  const [show, setShow] = useState(false);
  const severityData = {
    'Catastrophic': { level: 5, color: 'bg-red-600', people: 'Multiple Fatalities or Multiple Severe Casualties', environment: 'Reportable to authorities, external clean-up support required, typically >1 month to remediate, irreversible or chronic damage', monetary: '>USD 200MM', reputation: 'International concern resulting in irreparable damage to reputation across full spectrum of stakeholders' },
    'Major': { level: 4, color: 'bg-orange-600', people: 'Single Fatality or Non-fatal casualty with Permanent Disability', environment: 'Reportable to authorities, external clean-up support required, <1 month to remediate, effects are localised', monetary: 'USD 50MM - USD 200MM', reputation: 'National concern and/or media attention. Possible reputation damage with external stakeholders' },
    'Significant': { level: 3, color: 'bg-yellow-600', people: 'Serious Injury', environment: 'Small controllable impact, remediation with internal local resources requiring limited time', monetary: 'USD 10MM - USD 50MM', reputation: 'Local concern or disruption and/or local media attention' },
    'Moderate': { level: 2, color: 'bg-blue-600', people: 'Medical Treatment / Restricted Work Case', environment: 'Minimal impact requiring minimal and simple clean-up', monetary: 'USD 1MM - USD 10MM', reputation: 'Limited impact. Local public awareness but no concern' },
    'Minor': { level: 1, color: 'bg-green-600', people: 'First Aid', environment: 'Non-damaging material requiring minimal clean-up, contained spill, negligible impact', monetary: '<USD 1MM', reputation: 'No / slight impact' }
  };
  const info = severityData[severity];
  if (!info) return null;
  return (
    <div className="relative inline-block ml-2">
      <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-blue-500 hover:text-blue-700">
        <Info className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-50 w-96 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 left-6 top-0">
          <div className="mb-3">
            <div className={`inline-block px-3 py-1 rounded text-white text-sm font-semibold ${info.color}`}>Level {info.level}: {severity}</div>
          </div>
          <div className="space-y-3 text-xs">
            <div><div className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> People:</div><div className="text-gray-600 pl-4">{info.people}</div></div>
            <div><div className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Environment:</div><div className="text-gray-600 pl-4">{info.environment}</div></div>
            <div><div className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><Database className="w-3 h-3" /> Monetary Impact:</div><div className="text-gray-600 pl-4">{info.monetary}</div></div>
            <div><div className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Reputation:</div><div className="text-gray-600 pl-4">{info.reputation}</div></div>
          </div>
          <div className="absolute w-3 h-3 bg-white border-l-2 border-t-2 border-gray-300 transform rotate-45 -left-1.5 top-4"></div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [incidents, setIncidents] = useState([]);
  const [currentIncidentId, setCurrentIncidentId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showIncidentList, setShowIncidentList] = useState(false);
  const [data, setData] = useState({
    incidentDetails: { description: '', date: '', location: '', severity: '', analystName: '' },
    causalFactors: []
  });

  useEffect(() => { loadIncidents(); }, []);

  const loadIncidents = async () => {
    const { data, error } = await supabase.from('incidents').select('*');
    if (!error && data) setIncidents(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  };

  const saveIncident = async () => {
    setSaveStatus('saving');
    setErrorMessage('');
    const incidentData = {
      incident_date: data.incidentDetails.date || null,
      location: data.incidentDetails.location || null,
      severity: data.incidentDetails.severity || null,
      description: data.incidentDetails.description || null,
      analyst_name: data.incidentDetails.analystName || null,
      human_factors: { causalFactors: data.causalFactors },
      status: 'draft',
      updated_at: new Date().toISOString()
    };
    const result = currentIncidentId 
      ? await supabase.from('incidents').update(incidentData).eq('id', currentIncidentId)
      : await supabase.from('incidents').insert([incidentData]);
    if (result.error) {
      setErrorMessage(`Error: ${result.error.message}`);
      setSaveStatus('error');
    } else {
      if (!currentIncidentId && result.data?.[0]) setCurrentIncidentId(result.data[0].id);
      setSaveStatus('saved');
      await loadIncidents();
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const loadIncident = (incident) => {
    setCurrentIncidentId(incident.id);
    setData({
      incidentDetails: { 
        description: incident.description || '', 
        date: incident.incident_date || '', 
        location: incident.location || '', 
        severity: incident.severity || '', 
        analystName: incident.analyst_name || '' 
      },
      causalFactors: incident.human_factors?.causalFactors || []
    });
    setShowIncidentList(false);
  };

  const newIncident = () => {
    setCurrentIncidentId(null);
    setData({ 
      incidentDetails: { description: '', date: '', location: '', severity: '', analystName: '' }, 
      causalFactors: [] 
    });
  };

  const updateField = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const addCausalFactor = () => {
    const newFactor = {
      id: Date.now(),
      description: '',
      isExpanded: false,
      humanFactors: {},
      justCulture: { classification: '', justification: '', responseActions: '' },
      hop: { 
        errorPrecursors: '',
        systemDefenses: '',
        vulnerabilities: '',
        recommendations: ''
      },
      expandedSections: {},
      showJustCulture: false,
      showHOP: false
    };
    setData(prev => ({ ...prev, causalFactors: [...prev.causalFactors, newFactor] }));
  };

  const removeCausalFactor = (factorId) => {
    setData(prev => ({ 
      ...prev, 
      causalFactors: prev.causalFactors.filter(f => f.id !== factorId) 
    }));
  };

  const toggleCausalFactor = (factorId) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    }));
  };

  const updateCausalFactorDescription = (factorId, description) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? { ...f, description } : f
      )
    }));
  };

  const updateHumanFactor = (factorId, category, itemId, rating) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? {
          ...f,
          humanFactors: {
            ...f.humanFactors,
            [`${category}_${itemId}`]: { ...f.humanFactors[`${category}_${itemId}`], rating }
          }
        } : f
      )
    }));
  };

  const updateFactorNotes = (factorId, category, itemId, notes) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? {
          ...f,
          humanFactors: {
            ...f.humanFactors,
            [`${category}_${itemId}`]: { ...f.humanFactors[`${category}_${itemId}`], notes }
          }
        } : f
      )
    }));
  };

  const toggleCausalFactorSection = (factorId, section) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? {
          ...f,
          expandedSections: { ...f.expandedSections, [section]: !f.expandedSections[section] }
        } : f
      )
    }));
  };

  const updateJustCulture = (factorId, field, value) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? {
          ...f,
          justCulture: { ...f.justCulture, [field]: value }
        } : f
      )
    }));
  };

  const updateHOP = (factorId, field, value) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? {
          ...f,
          hop: { ...f.hop, [field]: value }
        } : f
      )
    }));
  };

  const toggleJustCulture = (factorId) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? { ...f, showJustCulture: !f.showJustCulture } : f
      )
    }));
  };

  const toggleHOPSection = (factorId) => {
    setData(prev => ({
      ...prev,
      causalFactors: prev.causalFactors.map(f => 
        f.id === factorId ? { ...f, showHOP: !f.showHOP } : f
      )
    }));
  };

  const factorCategories = {
    individual: { title: "Individual Factors (IOGP 621: 4.2.1)", icon: <Users className="w-5 h-5" />, items: [
      { id: 'fatigue', label: 'Fatigue / Alertness', taproot: 'Human Engineering', iogp: '4.2.1.1', tooltip: 'Consider work schedules, shift patterns, rest periods, and whether the individual was adequately rested and alert for the task.' },
      { id: 'competency', label: 'Competency / Training', taproot: 'Training Deficiency', iogp: '4.2.1.2', tooltip: 'Assess if the person had appropriate qualifications, training, and experience for the task they were performing.' },
      { id: 'situational', label: 'Situational Awareness', taproot: 'Management System', iogp: '4.2.1.3', tooltip: 'Evaluate whether the individual understood the current situation, recognized hazards, and anticipated potential consequences.' },
      { id: 'stress', label: 'Stress / Workload', taproot: 'Human Engineering', iogp: '4.2.1.4', tooltip: 'Consider time pressure, task complexity, mental/physical demands, and any personal or organizational stressors present.' },
      { id: 'health', label: 'Physical/Mental Health', taproot: 'Safeguards', iogp: '4.2.1.5', tooltip: 'Assess whether physical fitness, mental wellbeing, medication, or health conditions affected the individual\'s performance.' }
    ]},
    task: { title: "Task/Work Factors (IOGP 621: 4.2.2)", icon: <Brain className="w-5 h-5" />, items: [
      { id: 'procedure', label: 'Procedure Quality', taproot: 'Procedure Not Adequate', iogp: '4.2.2.1', tooltip: 'Evaluate if procedures were available, accurate, easy to follow, and appropriate for the actual working conditions.' },
      { id: 'complexity', label: 'Task Complexity', taproot: 'Human Engineering', iogp: '4.2.2.2', tooltip: 'Consider the number of steps, decision points, simultaneous activities, and cognitive demands required by the task.' },
      { id: 'time', label: 'Time Pressure', taproot: 'Management System', iogp: '4.2.2.3', tooltip: 'Assess whether deadlines, production targets, or scheduling created pressure that affected decision-making or performance.' },
      { id: 'tools', label: 'Tools/Equipment Design', taproot: 'Equipment Deficiency', iogp: '4.2.2.4', tooltip: 'Evaluate if tools and equipment were fit for purpose, properly maintained, ergonomically designed, and had adequate safety features.' },
      { id: 'communication', label: 'Communication', taproot: 'Communication Problem', iogp: '4.2.2.5', tooltip: 'Consider clarity of instructions, handovers, team coordination, language barriers, and effectiveness of information exchange.' }
    ]},
    organizational: { title: "Organizational Factors (IOGP 621: 4.2.3)", icon: <Shield className="w-5 h-5" />, items: [
      { id: 'culture', label: 'Safety Culture', taproot: 'Management System', iogp: '4.2.3.1', tooltip: 'Assess organizational attitudes toward safety, reporting culture, management commitment, and whether safety is prioritized over production.' },
      { id: 'resources', label: 'Resource Allocation', taproot: 'Management System', iogp: '4.2.3.2', tooltip: 'Evaluate if adequate people, equipment, time, and budget were provided to complete the work safely and effectively.' },
      { id: 'supervision', label: 'Supervision/Leadership', taproot: 'Management System', iogp: '4.2.3.3', tooltip: 'Consider quality of oversight, leadership presence, supervisor competence, and whether appropriate guidance was available when needed.' },
      { id: 'planning', label: 'Work Planning', taproot: 'Planning/Scheduling', iogp: '4.2.3.4', tooltip: 'Assess whether the work was properly planned, hazards identified, controls implemented, and coordination with other activities considered.' },
      { id: 'change', label: 'Change Management', taproot: 'Management of Change', iogp: '4.2.3.5', tooltip: 'Evaluate if changes to equipment, procedures, personnel, or conditions were properly assessed, communicated, and controlled.' }
    ]}
  };
if (showIncidentList) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Saved Incidents</h2>
          <div className="flex gap-3">
            <button onClick={newIncident} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">New</button>
            <button onClick={() => setShowIncidentList(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Back</button>
          </div>
        </div>
        <div className="bg-white rounded-lg border divide-y">
          {incidents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No incidents yet</div>
          ) : (
            incidents.map(inc => (
              <div key={inc.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => loadIncident(inc)}>
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{inc.description || 'Untitled'}</div>
                    <div className="text-sm text-gray-600">{inc.location} • {inc.incident_date}</div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{inc.severity}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">HFAT and HOP Tool</h1>
              <p className="text-sm text-gray-600">Human Factors Analysis Tool | IOGP 621 | Just Culture | HOP</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowIncidentList(true)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex gap-2">
              <List className="w-4 h-4" />All ({incidents.length})
            </button>
            <button onClick={saveIncident} disabled={saveStatus === 'saving'} className={`px-4 py-2 rounded flex gap-2 ${
              saveStatus === 'saved' ? 'bg-green-600 text-white' : saveStatus === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              {saveStatus === 'saving' ? <><Database className="w-4 h-4 animate-pulse" />Saving</> :
               saveStatus === 'saved' ? <><CheckCircle className="w-4 h-4" />Saved</> :
               saveStatus === 'error' ? <><XCircle className="w-4 h-4" />Error</> :
               <><Save className="w-4 h-4" />Save</>}
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <XCircle className="w-5 h-5 text-red-600 inline mr-2" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border mb-6">
        <div className="flex border-b">
          {[
            { id: 'analysis', label: 'Analysis', icon: <Brain className="w-4 h-4" /> },
            { id: 'report', label: 'Report', icon: <FileText className="w-4 h-4" /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 ${
              activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-4">Incident Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={data.incidentDetails.date} className="w-full border rounded px-3 py-2"
                  onChange={(e) => updateField('incidentDetails', 'date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Severity Level
                  {data.incidentDetails.severity && <SeverityInfo severity={data.incidentDetails.severity} />}
                </label>
                <select value={data.incidentDetails.severity} className="w-full border rounded px-3 py-2"
                  onChange={(e) => updateField('incidentDetails', 'severity', e.target.value)}>
                  <option value="">Select severity level...</option>
                  <option value="Minor">Minor (Level 1)</option>
                  <option value="Moderate">Moderate (Level 2)</option>
                  <option value="Significant">Significant (Level 3)</option>
                  <option value="Major">Major (Level 4)</option>
                  <option value="Catastrophic">Catastrophic (Level 5)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" value={data.incidentDetails.location} className="w-full border rounded px-3 py-2"
                  placeholder="Facility, unit, or area"
                  onChange={(e) => updateField('incidentDetails', 'location', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Analyst</label>
                <input type="text" value={data.incidentDetails.analystName} className="w-full border rounded px-3 py-2"
                  placeholder="Your name"
                  onChange={(e) => updateField('incidentDetails', 'analystName', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={data.incidentDetails.description} className="w-full border rounded px-3 py-2" rows="3"
                placeholder="Describe what happened..."
                onChange={(e) => updateField('incidentDetails', 'description', e.target.value)} />
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Causal Factors</h3>
              <button onClick={addCausalFactor} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Causal Factor
              </button>
            </div>
            
            {data.causalFactors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No causal factors added yet. Click "Add Causal Factor" to begin analysis.
              </div>
            ) : (
              <div className="space-y-4">
                {data.causalFactors.map((factor, index) => (
                  <div key={factor.id} className="border-2 border-blue-200 rounded-lg bg-blue-50">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold mb-2 text-blue-900">
                            Causal Factor {index + 1}
                          </label>
                          <textarea
                            value={factor.description}
                            onChange={(e) => updateCausalFactorDescription(factor.id, e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows="2"
                            placeholder="Describe this causal factor..."
                          />
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => toggleCausalFactor(factor.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title={factor.isExpanded ? "Collapse" : "Expand"}
                          >
                            {factor.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => removeCausalFactor(factor.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {factor.isExpanded && (
                        <div className="space-y-3 mt-4">
                          {Object.entries(factorCategories).map(([key, cat]) => (
                            <div key={key} className="bg-white border rounded">
                              <button 
                                onClick={() => toggleCausalFactorSection(factor.id, key)} 
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  {cat.icon}
                                  <h4 className="font-semibold text-sm">{cat.title}</h4>
                                </div>
                                {factor.expandedSections[key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              {factor.expandedSections[key] && (
                                <div className="p-3 border-t space-y-3">
                                  {cat.items.map(item => (
                                    <div key={item.id} className="border-l-4 border-blue-500 pl-3 py-2">
                                      <div className="flex justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{item.label}</span>
                                            <Tooltip text={item.tooltip}>
                                              <HelpCircle className="w-4 h-4 text-blue-500" />
                                            </Tooltip>
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">IOGP: {item.iogp} | TapRooT®: {item.taproot}</div>
                                        </div>
                                        <div className="flex gap-2">
                                          <button onClick={() => updateHumanFactor(factor.id, key, item.id, 'contributing')} 
                                            className={`px-3 py-1 text-xs rounded ${
                                              factor.humanFactors[`${key}_${item.id}`]?.rating === 'contributing' ? 
                                              'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'
                                            }`}>Contributing</button>
                                          <button onClick={() => updateHumanFactor(factor.id, key, item.id, 'causal')} 
                                            className={`px-3 py-1 text-xs rounded ${
                                              factor.humanFactors[`${key}_${item.id}`]?.rating === 'causal' ? 
                                              'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                                            }`}>Causal</button>
                                        </div>
                                      </div>
                                      <textarea 
                                        value={factor.humanFactors[`${key}_${item.id}`]?.notes || ''} 
                                        className="w-full text-sm border rounded px-3 py-2" 
                                        rows="2"
                                        placeholder="Describe how this factor contributed..."
                                        onChange={(e) => updateFactorNotes(factor.id, key, item.id, e.target.value)} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="bg-white border rounded">
                            <button
                              onClick={() => toggleJustCulture(factor.id)}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <h4 className="font-semibold text-sm">Just Culture Assessment</h4>
                              </div>
                              {factor.showJustCulture ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {factor.showJustCulture && (
                              <div className="p-3 border-t space-y-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                                    Classification
                                    <Tooltip text="Human Error: Unintended mistake anyone could make in same situation. At-Risk: Risky choice with unrecognized danger. Reckless: Deliberate disregard of known substantial risk.">
                                      <HelpCircle className="w-3 h-3 text-blue-500" />
                                    </Tooltip>
                                  </label>
                                  <select 
                                    value={factor.justCulture.classification} 
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    onChange={(e) => updateJustCulture(factor.id, 'classification', e.target.value)}>
                                    <option value="">Select...</option>
                                    <option value="Human Error">Human Error - Unintended action, system focus</option>
                                    <option value="At-Risk Behavior">At-Risk Behavior - Coaching & remove risk incentives</option>
                                    <option value="Reckless Behavior">Reckless Behavior - Conscious disregard of risk</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Justification</label>
                                  <textarea 
                                    value={factor.justCulture.justification} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="Document reasoning and evidence for this classification..."
                                    onChange={(e) => updateJustCulture(factor.id, 'justification', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Response Actions</label>
                                  <textarea 
                                    value={factor.justCulture.responseActions} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="Recommended actions based on classification..."
                                    onChange={(e) => updateJustCulture(factor.id, 'responseActions', e.target.value)} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-white border rounded">
                            <button
                              onClick={() => toggleHOPSection(factor.id)}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <h4 className="font-semibold text-sm">HOP (Human & Organizational Performance) Assessment</h4>
                              </div>
                              {factor.showHOP ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {factor.showHOP && (
                              <div className="p-3 border-t space-y-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                                    Error Precursors
                                    <Tooltip text="Were there changes, time pressure, distractions, or missing information that made error more likely?">
                                      <HelpCircle className="w-3 h-3 text-blue-500" />
                                    </Tooltip>
                                  </label>
                                  <textarea 
                                    value={factor.hop.errorPrecursors} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="Identify conditions that made errors likely (changes, time pressure, unclear information, etc.)..."
                                    onChange={(e) => updateHOP(factor.id, 'errorPrecursors', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                                    System Defenses
                                    <Tooltip text="What barriers existed? Which failed or were bypassed? Could the error have been caught?">
                                      <HelpCircle className="w-3 h-3 text-blue-500" />
                                    </Tooltip>
                                  </label>
                                  <textarea 
                                    value={factor.hop.systemDefenses} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="What defenses/barriers failed or were absent? Could error have been detected earlier?..."
                                    onChange={(e) => updateHOP(factor.id, 'systemDefenses', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                                    System Vulnerabilities
                                    <Tooltip text="What systemic weaknesses exist? What assumptions about human performance were flawed?">
                                      <HelpCircle className="w-3 h-3 text-blue-500" />
                                    </Tooltip>
                                  </label>
                                  <textarea 
                                    value={factor.hop.vulnerabilities} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="Identify systemic weaknesses and error-likely situations that could affect others..."
                                    onChange={(e) => updateHOP(factor.id, 'vulnerabilities', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                                    System Improvements
                                    <Tooltip text="What system changes will reduce error-likely conditions and strengthen defenses?">
                                      <HelpCircle className="w-3 h-3 text-blue-500" />
                                    </Tooltip>
                                  </label>
                                  <textarea 
                                    value={factor.hop.recommendations} 
                                    className="w-full border rounded px-2 py-1 text-sm" 
                                    rows="2"
                                    placeholder="Recommend system-level improvements to reduce error precursors and strengthen defenses..."
                                    onChange={(e) => updateHOP(factor.id, 'recommendations', e.target.value)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold text-lg mb-4">Analysis Summary Report</h3>
          
          <div className="space-y-6 text-sm">
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Incident Details</h4>
              <div className="space-y-1">
                <div><strong>Description:</strong> {data.incidentDetails.description || 'N/A'}</div>
                <div><strong>Date:</strong> {data.incidentDetails.date || 'N/A'}</div>
                <div><strong>Location:</strong> {data.incidentDetails.location || 'N/A'}</div>
                <div><strong>Severity:</strong> {data.incidentDetails.severity || 'N/A'}</div>
                <div><strong>Analyst:</strong> {data.incidentDetails.analystName || 'N/A'}</div>
              </div>
            </div>

            {data.causalFactors.length === 0 ? (
              <div className="text-gray-500 italic">No causal factors analyzed yet.</div>
            ) : (
              data.causalFactors.map((factor, index) => (
                <div key={factor.id} className="border-b pb-4">
                  <h4 className="font-semibold mb-2 text-blue-900">Causal Factor {index + 1}</h4>
                  <div className="mb-3">
                    <strong>Description:</strong> {factor.description || 'Not provided'}
                  </div>

                  <div className="mb-3">
                    <strong>Human Factors Identified:</strong>
                    {Object.entries(factor.humanFactors).filter(([_, v]) => v.rating).length > 0 ? (
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        {Object.entries(factor.humanFactors).map(([k, v]) => 
                          v.rating ? (
                            <li key={k}>
                              <strong>{k.replace(/_/g, ' ')}:</strong> {v.notes} 
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                v.rating === 'causal' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {v.rating}
                              </span>
                            </li>
                          ) : null
                        )}
                      </ul>
                    ) : <span className="text-gray-500"> None identified</span>}
                  </div>

                  {factor.justCulture.classification && (
                    <div className="bg-gray-50 p-3 rounded mt-3">
                      <div className="font-semibold mb-2">Just Culture Assessment</div>
                      <div><strong>Classification:</strong> {factor.justCulture.classification}</div>
                      {factor.justCulture.justification && (
                        <div className="mt-2"><strong>Justification:</strong> {factor.justCulture.justification}</div>
                      )}
                      {factor.justCulture.responseActions && (
                        <div className="mt-2"><strong>Response Actions:</strong> {factor.justCulture.responseActions}</div>
                      )}
                    </div>
                  )}

                  {(factor.hop.errorPrecursors || factor.hop.systemDefenses || factor.hop.vulnerabilities || factor.hop.recommendations) && (
                    <div className="bg-blue-50 p-3 rounded mt-3">
                      <div className="font-semibold mb-2">HOP Assessment</div>
                      {factor.hop.errorPrecursors && (
                        <div className="mb-2"><strong>Error Precursors:</strong> {factor.hop.errorPrecursors}</div>
                      )}
                      {factor.hop.systemDefenses && (
                        <div className="mb-2"><strong>System Defenses:</strong> {factor.hop.systemDefenses}</div>
                      )}
                      {factor.hop.vulnerabilities && (
                        <div className="mb-2"><strong>System Vulnerabilities:</strong> {factor.hop.vulnerabilities}</div>
                      )}
                      {factor.hop.recommendations && (
                        <div><strong>System Improvements:</strong> {factor.hop.recommendations}</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
