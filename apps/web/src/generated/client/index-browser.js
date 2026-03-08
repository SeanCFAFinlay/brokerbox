
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  role: 'role',
  baseCommissionSplit: 'baseCommissionSplit',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lenderId: 'lenderId',
  outlookAccessToken: 'outlookAccessToken',
  outlookRefreshToken: 'outlookRefreshToken',
  outlookTokenExpiry: 'outlookTokenExpiry',
  outlookEnabled: 'outlookEnabled'
};

exports.Prisma.BorrowerScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  province: 'province',
  postalCode: 'postalCode',
  income: 'income',
  verifiedIncome: 'verifiedIncome',
  employmentStatus: 'employmentStatus',
  borrowerType: 'borrowerType',
  liabilities: 'liabilities',
  creditScore: 'creditScore',
  creditScoreDate: 'creditScoreDate',
  dateOfBirth: 'dateOfBirth',
  coBorrowerName: 'coBorrowerName',
  coBorrowerEmail: 'coBorrowerEmail',
  notes: 'notes',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LenderScalarFieldEnum = {
  id: 'id',
  name: 'name',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  contactName: 'contactName',
  minCreditScore: 'minCreditScore',
  maxLTV: 'maxLTV',
  maxGDS: 'maxGDS',
  maxTDS: 'maxTDS',
  supportedProvinces: 'supportedProvinces',
  propertyTypes: 'propertyTypes',
  positionTypes: 'positionTypes',
  productCategories: 'productCategories',
  minLoan: 'minLoan',
  maxLoan: 'maxLoan',
  termMin: 'termMin',
  termMax: 'termMax',
  pricingPremium: 'pricingPremium',
  baseRate: 'baseRate',
  lenderFees: 'lenderFees',
  speed: 'speed',
  exceptionsTolerance: 'exceptionsTolerance',
  appetite: 'appetite',
  capitalAvailable: 'capitalAvailable',
  capitalCommitted: 'capitalCommitted',
  notes: 'notes',
  underwritingNotes: 'underwritingNotes',
  documentRequirements: 'documentRequirements',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CapitalPoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  totalAmount: 'totalAmount',
  availableAmount: 'availableAmount',
  effectiveLTV: 'effectiveLTV',
  utilizationRate: 'utilizationRate',
  minInvestment: 'minInvestment',
  targetYield: 'targetYield',
  status: 'status',
  lenderId: 'lenderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvestmentScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  yield: 'yield',
  status: 'status',
  poolId: 'poolId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DealScalarFieldEnum = {
  id: 'id',
  borrowerId: 'borrowerId',
  lenderId: 'lenderId',
  stage: 'stage',
  priority: 'priority',
  propertyAddress: 'propertyAddress',
  propertyType: 'propertyType',
  propertyValue: 'propertyValue',
  loanAmount: 'loanAmount',
  interestRate: 'interestRate',
  termMonths: 'termMonths',
  amortMonths: 'amortMonths',
  position: 'position',
  loanPurpose: 'loanPurpose',
  occupancyType: 'occupancyType',
  exitStrategy: 'exitStrategy',
  ltv: 'ltv',
  gds: 'gds',
  tds: 'tds',
  monthlyPayment: 'monthlyPayment',
  matchScore: 'matchScore',
  brokerFee: 'brokerFee',
  lenderFee: 'lenderFee',
  totalRevenue: 'totalRevenue',
  agentCommissionSplit: 'agentCommissionSplit',
  netBrokerageRevenue: 'netBrokerageRevenue',
  closingDate: 'closingDate',
  fundingDate: 'fundingDate',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DealStageHistoryScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  fromStage: 'fromStage',
  toStage: 'toStage',
  changedBy: 'changedBy',
  changedAt: 'changedAt'
};

exports.Prisma.ScenarioScalarFieldEnum = {
  id: 'id',
  borrowerId: 'borrowerId',
  dealId: 'dealId',
  name: 'name',
  type: 'type',
  status: 'status',
  inputs: 'inputs',
  results: 'results',
  exitCost: 'exitCost',
  isPreferred: 'isPreferred',
  recommendationNotes: 'recommendationNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatchRunScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  timestamp: 'timestamp'
};

exports.Prisma.LenderMatchSnapshotScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  matchRunId: 'matchRunId',
  lenderId: 'lenderId',
  score: 'score',
  passed: 'passed',
  failures: 'failures',
  snapshot: 'snapshot',
  timestamp: 'timestamp'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startTime: 'startTime',
  endTime: 'endTime',
  eventType: 'eventType',
  sourceId: 'sourceId',
  sourceType: 'sourceType',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoanScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  poolId: 'poolId',
  status: 'status',
  fundedDate: 'fundedDate',
  maturityDate: 'maturityDate',
  principalBalance: 'principalBalance',
  interestRate: 'interestRate',
  interestType: 'interestType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoanPaymentScalarFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  amount: 'amount',
  date: 'date',
  type: 'type',
  status: 'status',
  principalPortion: 'principalPortion',
  interestPortion: 'interestPortion',
  createdAt: 'createdAt'
};

exports.Prisma.LoanFeeScalarFieldEnum = {
  id: 'id',
  loanId: 'loanId',
  amount: 'amount',
  description: 'description',
  type: 'type',
  isPaid: 'isPaid',
  createdAt: 'createdAt'
};

exports.Prisma.NoteScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  content: 'content',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.DocRequestScalarFieldEnum = {
  id: 'id',
  borrowerId: 'borrowerId',
  dealId: 'dealId',
  docType: 'docType',
  category: 'category',
  status: 'status',
  expiresAt: 'expiresAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentFileScalarFieldEnum = {
  id: 'id',
  docRequestId: 'docRequestId',
  filename: 'filename',
  path: 'path',
  mimeType: 'mimeType',
  fileSize: 'fileSize',
  version: 'version',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.DealConditionScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  description: 'description',
  status: 'status',
  clearedAt: 'clearedAt',
  docRequestId: 'docRequestId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  dueDate: 'dueDate',
  status: 'status',
  priority: 'priority',
  assignedToId: 'assignedToId',
  entityType: 'entityType',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dealId: 'dealId'
};

exports.Prisma.DealActivityScalarFieldEnum = {
  id: 'id',
  actor: 'actor',
  actorName: 'actorName',
  entity: 'entity',
  entityId: 'entityId',
  action: 'action',
  diff: 'diff',
  metadata: 'metadata',
  timestamp: 'timestamp'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  type: 'type',
  read: 'read',
  link: 'link',
  createdAt: 'createdAt'
};

exports.Prisma.BrokerageSettingsScalarFieldEnum = {
  id: 'id',
  brokerageName: 'brokerageName',
  licenseNumber: 'licenseNumber',
  principalBroker: 'principalBroker',
  officeAddress: 'officeAddress',
  officePhone: 'officePhone',
  officeEmail: 'officeEmail',
  defaultBrokerFee: 'defaultBrokerFee',
  defaultLenderFee: 'defaultLenderFee',
  defaultTermMonths: 'defaultTermMonths',
  defaultAmortMonths: 'defaultAmortMonths',
  defaultInterestRate: 'defaultInterestRate'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  User: 'User',
  Borrower: 'Borrower',
  Lender: 'Lender',
  CapitalPool: 'CapitalPool',
  Investment: 'Investment',
  Deal: 'Deal',
  DealStageHistory: 'DealStageHistory',
  Scenario: 'Scenario',
  MatchRun: 'MatchRun',
  LenderMatchSnapshot: 'LenderMatchSnapshot',
  CalendarEvent: 'CalendarEvent',
  Loan: 'Loan',
  LoanPayment: 'LoanPayment',
  LoanFee: 'LoanFee',
  Note: 'Note',
  DocRequest: 'DocRequest',
  DocumentFile: 'DocumentFile',
  DealCondition: 'DealCondition',
  Task: 'Task',
  DealActivity: 'DealActivity',
  Notification: 'Notification',
  BrokerageSettings: 'BrokerageSettings'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
