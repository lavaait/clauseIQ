import React from 'react';
import { CheckCircle, Clock, Flag, AlertTriangle } from 'lucide-react';

export const statusColors = {
  completed: 'bg-occ-secondary-blue occ-secondary-white',
  'in-progress': 'bg-occ-blue occ-secondary-white',
  pending: 'bg-occ-gray occ-secondary-white',
  overdue: 'bg-occ-secondary-orange occ-secondary-white'
};

export const statusBorderColors = {
  completed: 'border-occ-secondary-blue',
  'in-progress': 'border-occ-blue',
  pending: 'border-occ-gray',
  overdue: 'border-occ-secondary-orange'
};

export const statusDots = {
  completed: 'bg-occ-secondary-blue',
  'in-progress': 'bg-occ-blue',
  pending: 'bg-occ-gray',
  overdue: 'bg-occ-secondary-orange'
};

export const statusIcons = {
  completed: <CheckCircle className="w-4 h-4 occ-secondary-white" />,
  'in-progress': <Clock className="w-4 h-4 occ-secondary-white" />,
  pending: <Flag className="w-4 h-4 occ-secondary-white" />,
  overdue: <AlertTriangle className="w-4 h-4 occ-secondary-white" />
};

export const typeColors = {
  RFI: 'bg-purple-100 text-purple-800',
  RFP: 'bg-occ-blue-dark occ-secondary-white',
  Evaluation: 'bg-occ-secondary-orange occ-secondary-white',
  Legal: 'bg-occ-gray occ-secondary-white',
  Award: 'bg-occ-secondary-blue occ-secondary-white',
  Other: 'bg-occ-gray occ-secondary-white'
};