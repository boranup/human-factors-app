import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Brain, Shield, FileText, ChevronDown, ChevronRight, CheckCircle, XCircle, Save, Database, List } from 'lucide-react';

// 🔥 REPLACE THESE WITH YOUR SUPABASE VALUES
const SUPABASE_URL = 'https://epabheqggsudcwsvflat.supabase.co';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedSections, setExpandedSections] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [currentIncidentId, setCurrentIncidentId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showIncidentList, setShowIncidentList] = useState(false);
  
  const [data, setData] = useState({
    incidentDetails: { description: '', date: '', location: '', severity: '', analystName: '' },
    humanFactors: {},
    justCulture: { classification: '', justification: '', responseActions: '' }
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
      human_factors: data.humanFactors || {},
      just_culture_assessment: data.justCulture || {},
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
      humanFactors: incident.human_factors || {},
      justCulture: incident.just_culture_assessment || {}
    });
    setShowIncidentList(false);
  };

  const newIncident = () => {
    setCurrentIncidentId(null);
    setData({
      incidentDetails: { description: '', date: '', location: '', severity: '', analystName: '' },
      humanFactors: {},
      justCulture: { classification: '', justification: '', responseActions: '' }
    });
  };

  const updateField = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateHumanFactor = (category, factorId, rating) => {
    setData(prev => ({
      ...prev,
      humanFactors: {
        ...prev.humanFactors,
        [`${category}_${factorId}`]: { ...prev.humanFactors[`${category}_${factorId}`], rating }
      }
    }));
  };

  const updateFactorNotes = (category, factorId, notes) => {
    setData(prev => ({
      ...prev,
      humanFactors: {
        ...prev.humanFactors,
        [`${category}_${factorId}`]: { ...prev.humanFactors[`${category}_${factorId}`], notes }
      }
    }));
  };

  const factors = {
    individual: {
      title: "Individual Factors (IOGP 621: 4.2.1)",
      icon: <Users className="w-5 h-5" />,
      items: [
        { id: 'fatigue', label: 'Fatigue / Alertness', taproot: 'Human Engineering', iogp: '4.2.1.1' },
        { id: 'competency', label: 'Competency / Training', taproot: 'Training Deficiency', iogp: '4.2.1.2' },
        { id: 'situational', label: 'Situational Awareness', taproot: 'Management System', iogp: '4.2.1.3' },
        { id: 'stress', label: 'Stress / Workload', taproot: 'Human Engineering', iogp: '4.2.1.4' },
        { id: 'health', label: 'Physical/Mental Health', taproot: 'Safeguards', iogp: '4.2.1.5' }
      ]
    },
    task: {
      title: "Task/Work Factors (IOGP 621: 4.2.2)",
      icon: <Brain className="w-5 h-5" />,
      items: [
        { id: 'procedure', label: 'Procedure Quality', taproot: 'Procedure Not Adequate', iogp: '4.2.2.1' },
        { id: 'complexity', label: 'Task Complexity', taproot: 'Human Engineering', iogp: '4.2.2.2' },
        { id: 'time', label: 'Time Pressure', taproot: 'Management System', iogp: '4.2.2.3' },
        { id: 'tools', label: 'Tools/Equipment Design', taproot: 'Equipment Deficiency', iogp: '4.2.2.4' },
        { id: 'communication', label: 'Communication', taproot: 'Communication Problem', iogp: '4.2.2.5' }
      ]
    },
    organizational: {
      title: "Organizational Factors (IOGP 621: 4.2.3)",
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'culture', label: 'Safety Culture', taproot: 'Management System', iogp: '4.2.3.1' },
        { id: 'resources', label: 'Resource Allocation', taproot: 'Management System', iogp: '4.2.3.2' },
        { id: 'supervision', label: 'Supervision/Leadership', taproot: 'Management System', iogp: '4.2.3.3' },
        { id: 'planning', label: 'Work Planning', taproot: 'Planning/Scheduling', iogp: '4.2.3.4' },
        { id: 'change', label: 'Change Management', taproot: 'Management of Change', iogp: '4.2.3.5' }
      ]
    }
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
              <h1 className="text-3xl font-bold">Human Factors Analysis</h1>
              <p className="text-sm text-gray-600">IOGP 621 | Just Culture</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowIncidentList(true)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex gap-2">
              <List className="w-4 h-4" />All ({incidents.length})
            </button>
            <button onClick={saveIncident} disabled={saveStatus === 'saving'} className={`px-4 py-2 rounded flex gap-2 ${
              saveStatus === 'saved' ? 'bg-green-600 text-white' :
              saveStatus === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
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
            { id: 'justculture', label: 'Just Culture', icon: <Shield className="w-4 h-4" /> },
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
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select value={data.incidentDetails.severity} className="w-full border rounded px-3 py-2"
                  onChange={(e) => updateField('incidentDetails', 'severity', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Minor</option>
                  <option>Significant</option>
                  <option>Major</option>
                  <option>Catastrophic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" value={data.incidentDetails.location} className="w-full border rounded px-3 py-2"
                  onChange={(e) => updateField('incidentDetails', 'location', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Analyst</label>
                <input type="text" value={data.incidentDetails.analystName} className="w-full border rounded px-3 py-2"
                  onChange={(e) => updateField('incidentDetails', 'analystName', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={data.incidentDetails.description} className="w-full border rounded px-3 py-2" rows="3"
                onChange={(e) => updateField('incidentDetails', 'description', e.target.value)} />
            </div>
          </div>

          {Object.entries(factors).map(([key, cat]) => (
            <div key={key} className="bg-white border rounded">
              <button onClick={() => setExpandedSections(p => ({...p, [key]: !p[key]}))} 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <h3 className="font-semibold">{cat.title}</h3>
                </div>
                {expandedSections[key] ? <ChevronDown /> : <ChevronRight />}
              </button>
              {expandedSections[key] && (
                <div className="p-4 border-t space-y-4">
                  {cat.items.map(item => (
                    <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-gray-600">IOGP: {item.iogp} | TapRooT®: {item.taproot}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateHumanFactor(key, item.id, 'contributing')} 
                            className={`px-3 py-1 text-xs rounded ${
                              data.humanFactors[`${key}_${item.id}`]?.rating === 'contributing' ? 
                              'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'
                            }`}>Contributing</button>
                          <button onClick={() => updateHumanFactor(key, item.id, 'causal')} 
                            className={`px-3 py-1 text-xs rounded ${
                              data.humanFactors[`${key}_${item.id}`]?.rating === 'causal' ? 
                              'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                            }`}>Causal</button>
                        </div>
                      </div>
                      <textarea value={data.humanFactors[`${key}_${item.id}`]?.notes || ''} 
                        className="w-full text-sm border rounded px-3 py-2" rows="2"
                        onChange={(e) => updateFactorNotes(key, item.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'justculture' && (
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">Just Culture Assessment</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Classification</label>
              <select value={data.justCulture.classification} className="w-full border rounded px-3 py-2"
                onChange={(e) => updateField('justCulture', 'classification', e.target.value)}>
                <option value="">Select...</option>
                <option>Human Error</option>
                <option>At-Risk Behavior</option>
                <option>Reckless Behavior</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Justification</label>
              <textarea value={data.justCulture.justification} className="w-full border rounded px-3 py-2" rows="4"
                onChange={(e) => updateField('justCulture', 'justification', e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-2">Response Actions</label>
              <textarea value={data.justCulture.responseActions} className="w-full border rounded px-3 py-2" rows="3"
                onChange={(e) => updateField('justCulture', 'responseActions', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">Analysis Summary</h3>
          <div className="space-y-4 text-sm">
            <div><strong>Description:</strong> {data.incidentDetails.description || 'N/A'}</div>
            <div><strong>Date:</strong> {data.incidentDetails.date || 'N/A'}</div>
            <div><strong>Severity:</strong> {data.incidentDetails.severity || 'N/A'}</div>
            <div><strong>Classification:</strong> {data.justCulture.classification || 'N/A'}</div>
            <div>
              <strong>Human Factors:</strong>
              {Object.entries(data.humanFactors).filter(([_, v]) => v.rating).length > 0 ? (
                <ul className="list-disc ml-5 mt-2">
                  {Object.entries(data.humanFactors).map(([k, v]) => 
                    v.rating ? <li key={k}>{k.replace(/_/g, ' ')}: {v.notes} ({v.rating})</li> : null
                  )}
                </ul>
              ) : <span> None identified</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

