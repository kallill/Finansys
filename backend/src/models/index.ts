import User from './User';
import Transaction from './Transaction';
import LearnedPattern from './LearnedPattern';
import CreditCard from './CreditCard';

import CRMAdmin from './CRMAdmin';
import CRMCliente from './CRMCliente';
import CRMPlano from './CRMPlano';
import CRMAssinatura from './CRMAssinatura';
import CRMOrdemServico from './CRMOrdemServico';
import CRMAnexoOS from './CRMAnexoOS';

// NOTA: Relacionamentos User/Transaction/CreditCard/LearnedPattern ja definidos
// dentro dos proprios arquivos de Model (Transaction.ts, CreditCard.ts, etc.).
// NAO redefinir aqui para evitar SequelizeAssociationError de alias duplicado.

// === Relacionamentos CRM ===

// Cliente -> Assinaturas (1:N)
CRMCliente.hasMany(CRMAssinatura, { foreignKey: 'cliente_id', as: 'assinaturas' });
CRMAssinatura.belongsTo(CRMCliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Plano -> Assinaturas (1:N)
CRMPlano.hasMany(CRMAssinatura, { foreignKey: 'plano_id', as: 'assinaturas' });
CRMAssinatura.belongsTo(CRMPlano, { foreignKey: 'plano_id', as: 'plano' });

// Cliente -> OS (1:N)
CRMCliente.hasMany(CRMOrdemServico, { foreignKey: 'cliente_id', as: 'ordens_servico' });
CRMOrdemServico.belongsTo(CRMCliente, { foreignKey: 'cliente_id', as: 'cliente' });

// OS -> Anexos (1:N)
CRMOrdemServico.hasMany(CRMAnexoOS, { foreignKey: 'os_id', as: 'anexos' });
CRMAnexoOS.belongsTo(CRMOrdemServico, { foreignKey: 'os_id', as: 'ordem_servico' });

export { 
  User, Transaction, LearnedPattern, CreditCard,
  CRMAdmin, CRMCliente, CRMPlano, CRMAssinatura, CRMOrdemServico, CRMAnexoOS
};