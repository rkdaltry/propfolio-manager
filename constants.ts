import { Property, PropertyType } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop_1',
    address: '12 Oak Avenue, Manchester',
    postcode: 'M14 5PQ',
    type: PropertyType.HMO,
    imageUrl: 'https://picsum.photos/800/600?random=1',
    purchaseDate: '2019-05-15',
    owner: 'J. Smith Holdings Ltd',
    description: 'A spacious 3-storey Victorian semi-detached property converted into a high-spec 6-bed HMO. Located close to the university campus and local amenities, making it ideal for student lets.',
    mortgage: {
      lenderName: 'Halifax',
      termYears: 25,
      fixedRateExpiry: '2024-05-15',
      monthlyPayment: 850,
      interestRate: 3.2,
      type: 'Fixed'
    },
    buildingsInsurance: {
      provider: 'Direct Line',
      premium: 450,
      renewalDate: '2024-06-01',
      policyNumber: 'DL-998877'
    },
    hmoLicence: {
      renewalDate: '2025-08-20',
      licenceNumber: 'HMO-MAN-001'
    },
    gasCertificate: {
      expiryDate: '2024-11-10',
      status: 'Valid'
    },
    eicrCertificate: {
      expiryDate: '2028-04-15',
      status: 'Valid'
    },
    epcCertificate: {
      expiryDate: '2029-05-15',
      status: 'Valid'
    },
    utilities: [
      { type: 'Gas', providerName: 'British Gas', accountNumber: 'BG-123' },
      { type: 'Electric', providerName: 'Octopus Energy', accountNumber: 'OE-456' },
      { type: 'Water', providerName: 'United Utilities', accountNumber: 'UU-789' },
      { type: 'Internet', providerName: 'Virgin Media', accountNumber: 'VM-000' }
    ],
    councilTax: {
      band: 'D',
      annualCost: 1800
    },
    productInsurances: [
      { id: 'pi_1', itemName: 'Boiler Care', provider: 'Homeserve', renewalDate: '2024-11-15', premium: 120 }
    ],
    tenants: [
      {
        id: 't_1',
        roomId: 'Room 1',
        name: 'Sarah Jenkins',
        rentAmount: 550,
        depositAmount: 550,
        depositReference: 'DPS-112233',
        tenancyStartDate: '2023-09-01',
        tenancyEndDate: '2024-08-31',
        rightToRentExpiry: '2025-09-01',
        outstandingBalance: 0,
        payments: [
            { id: 'p_1', date: '2024-03-01', amount: 550, type: 'Rent', reference: 'FPS S JENKINS' },
            { id: 'p_2', date: '2024-02-01', amount: 550, type: 'Rent', reference: 'FPS S JENKINS' }
        ],
        documents: []
      },
      {
        id: 't_2',
        roomId: 'Room 2',
        name: 'Mike Ross',
        rentAmount: 600,
        depositAmount: 600,
        depositReference: 'DPS-445566',
        tenancyStartDate: '2023-10-01',
        tenancyEndDate: '2024-09-30',
        rightToRentExpiry: '2024-05-01', // Expiring soon example
        outstandingBalance: 600,
        payments: [
            { id: 'p_3', date: '2024-02-01', amount: 600, type: 'Rent', reference: 'MROSS RENT' }
        ],
        documents: []
      },
      {
        id: 't_3',
        roomId: 'Room 3',
        name: 'Empty',
        rentAmount: 0,
        depositAmount: 0,
        depositReference: '',
        tenancyStartDate: '',
        tenancyEndDate: '',
        outstandingBalance: 0,
        payments: [],
        documents: []
      }
    ],
    documents: [],
    transactions: [
      { id: 'tx_1', date: '2024-03-05', type: 'Expense', category: 'Maintenance', amount: 150, description: 'Boiler Service' },
      { id: 'tx_2', date: '2024-03-01', type: 'Income', category: 'Rent', amount: 1150, description: 'March Rent Received' },
      { id: 'tx_3', date: '2024-02-15', type: 'Expense', category: 'Mortgage', amount: 850, description: 'Monthly Payment' }
    ]
  },
  {
    id: 'prop_2',
    address: '45b High Street, Leeds',
    postcode: 'LS6 2AB',
    type: PropertyType.FLAT,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    purchaseDate: '2021-02-10',
    owner: 'Private Portfolio',
    description: 'Modern 2-bedroom apartment situated in the city center. Features an open-plan living area, balcony, and secure underground parking. Currently let to young professionals.',
    mortgage: {
      lenderName: 'NatWest',
      termYears: 20,
      fixedRateExpiry: '2026-02-10',
      monthlyPayment: 500,
      interestRate: 2.9,
      type: 'Tracker'
    },
    buildingsInsurance: {
      provider: 'AXA',
      premium: 250,
      renewalDate: '2025-01-15',
      policyNumber: 'AX-1122'
    },
    gasCertificate: {
      expiryDate: '2024-03-01', // Expiring soon/Expired example
      status: 'Expired'
    },
    eicrCertificate: {
      expiryDate: '2026-02-10',
      status: 'Valid'
    },
    utilities: [
      { type: 'Electric', providerName: 'Bulb', accountNumber: 'B-777' },
      { type: 'Water', providerName: 'Yorkshire Water', accountNumber: 'YW-888' }
    ],
    councilTax: {
      band: 'A',
      annualCost: 1100
    },
    groundRent: {
      amount: 250,
      reviewDate: '2030-02-10',
      period: 'Annually'
    },
    productInsurances: [],
    tenants: [
      {
        id: 't_4',
        name: 'Emily Clark',
        rentAmount: 850,
        depositAmount: 950,
        depositReference: 'TDS-9900',
        tenancyStartDate: '2023-05-01',
        tenancyEndDate: '2024-05-01',
        rightToRentExpiry: '', // Indefinite/UK citizen example (empty)
        outstandingBalance: 0,
        payments: [
             { id: 'p_4', date: '2024-03-01', amount: 850, type: 'Rent', reference: 'ECLARK MAR' },
             { id: 'p_5', date: '2024-02-01', amount: 850, type: 'Rent', reference: 'ECLARK FEB' }
        ],
        documents: []
      }
    ],
    documents: [],
    transactions: [
       { id: 'tx_4', date: '2024-03-01', type: 'Income', category: 'Rent', amount: 850, description: 'March Rent' },
       { id: 'tx_5', date: '2024-03-10', type: 'Expense', category: 'Ground Rent', amount: 250, description: 'Annual Ground Rent' }
    ]
  }
];