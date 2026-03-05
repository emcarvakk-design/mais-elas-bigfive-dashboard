import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock do banco de dados ───────────────────────────────────────────────────
vi.mock('./db', () => ({
  upsertBigfiveProfile: vi.fn().mockResolvedValue(undefined),
  getAllBigfiveProfiles: vi.fn().mockResolvedValue([
    {
      id: 'bf_dGVzdEBleGFtcGxlLmNvbQ',
      name: 'Teste Silva',
      email: 'test@example.com',
      responseTimestamp: '01/01/2026 10:00:00',
      rawResponses: Array(30).fill(3),
      dimensions: {
        openness: { name: 'Abertura à Experiência', label: 'Abertura à Experiência', emoji: '🌿', score: 60, classification: 'moderate', description: 'Boa abertura' },
        conscientiousness: { name: 'Conscienciosidade', label: 'Conscienciosidade', emoji: '⚡', score: 75, classification: 'high', description: 'Alta organização' },
        extraversion: { name: 'Extroversão', label: 'Extroversão', emoji: '☀️', score: 50, classification: 'moderate', description: 'Ambivertida' },
        agreeableness: { name: 'Agradabilidade', label: 'Agradabilidade', emoji: '💚', score: 80, classification: 'very_high', description: 'Alta empatia' },
        emotionalStability: { name: 'Estabilidade Emocional', label: 'Estabilidade Emocional', emoji: '🌊', score: 65, classification: 'moderate', description: 'Boa resiliência' },
      },
      combinationInsights: ['💛 Alta agradabilidade'],
      recommendations: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ]),
  deleteBigfiveProfile: vi.fn().mockResolvedValue(undefined),
  deleteAllBigfiveProfiles: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock do contexto tRPC ────────────────────────────────────────────────────
const mockCtx = {
  req: {} as any,
  res: {} as any,
  user: null,
};

// ─── Importar o router após os mocks ─────────────────────────────────────────
import { appRouter } from './routers';
import {
  getAllBigfiveProfiles,
  upsertBigfiveProfile,
  deleteBigfiveProfile,
  deleteAllBigfiveProfiles,
} from './db';

const caller = appRouter.createCaller(mockCtx as any);

describe('profiles.list', () => {
  it('retorna lista de perfis do banco', async () => {
    const result = await caller.profiles.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Teste Silva');
    expect(result[0].email).toBe('test@example.com');
    expect(getAllBigfiveProfiles).toHaveBeenCalled();
  });

  it('mapeia responseTimestamp para timestamp', async () => {
    const result = await caller.profiles.list();
    expect(result[0].timestamp).toBe('01/01/2026 10:00:00');
  });
});

describe('profiles.upsertBatch', () => {
  const sampleProfile = {
    id: 'bf_dGVzdEBleGFtcGxlLmNvbQ',
    name: 'Teste Silva',
    email: 'test@example.com',
    timestamp: '01/01/2026 10:00:00',
    rawResponses: Array(30).fill(3),
    dimensions: {
      openness: { name: 'Abertura à Experiência', label: 'Abertura à Experiência', emoji: '🌿', score: 60, classification: 'moderate' as const, description: 'Boa abertura' },
      conscientiousness: { name: 'Conscienciosidade', label: 'Conscienciosidade', emoji: '⚡', score: 75, classification: 'high' as const, description: 'Alta organização' },
      extraversion: { name: 'Extroversão', label: 'Extroversão', emoji: '☀️', score: 50, classification: 'moderate' as const, description: 'Ambivertida' },
      agreeableness: { name: 'Agradabilidade', label: 'Agradabilidade', emoji: '💚', score: 80, classification: 'very_high' as const, description: 'Alta empatia' },
      emotionalStability: { name: 'Estabilidade Emocional', label: 'Estabilidade Emocional', emoji: '🌊', score: 65, classification: 'moderate' as const, description: 'Boa resiliência' },
    },
    combinationInsights: ['💛 Alta agradabilidade'],
    recommendations: [],
  };

  it('salva um lote de perfis no banco', async () => {
    const result = await caller.profiles.upsertBatch([sampleProfile]);
    expect(result.saved).toBe(1);
    expect(upsertBigfiveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bf_dGVzdEBleGFtcGxlLmNvbQ',
        name: 'Teste Silva',
        email: 'test@example.com',
        responseTimestamp: '01/01/2026 10:00:00',
      })
    );
  });

  it('salva múltiplos perfis em lote', async () => {
    vi.clearAllMocks();
    const result = await caller.profiles.upsertBatch([sampleProfile, { ...sampleProfile, id: 'bf_other', email: 'other@example.com' }]);
    expect(result.saved).toBe(2);
    expect(upsertBigfiveProfile).toHaveBeenCalledTimes(2);
  });
});

describe('profiles.delete', () => {
  it('remove um perfil pelo ID', async () => {
    const result = await caller.profiles.delete({ id: 'bf_dGVzdEBleGFtcGxlLmNvbQ' });
    expect(result.success).toBe(true);
    expect(deleteBigfiveProfile).toHaveBeenCalledWith('bf_dGVzdEBleGFtcGxlLmNvbQ');
  });
});

describe('profiles.deleteAll', () => {
  it('remove todos os perfis', async () => {
    const result = await caller.profiles.deleteAll();
    expect(result.success).toBe(true);
    expect(deleteAllBigfiveProfiles).toHaveBeenCalled();
  });
});
