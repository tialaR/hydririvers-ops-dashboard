'use client';

import { useMemo, useState } from 'react';
import { CargoGlassCard, type CargoGlassCardPalette } from '../cargo-glass-card';
import styles from './minhas-cargas-glass-lab.module.sass';

type CargoFilter = 'all' | CargoGlassCardPalette;

type LabCargo = {
  id: string;
  title: string;
  route: string;
  dateTime: string;
  tonnage: string;
  cargoType: string;
  statusLabel: string;
  variant: CargoGlassCardPalette;
};

const FILTERS: Array<{ label: string; value: CargoFilter }> = [
  { label: 'Todas', value: 'all' },
  { label: 'Laranja', value: 'orange' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Ciano', value: 'cyan' },
  { label: 'Cinza', value: 'graySoft' },
  { label: 'Grafite', value: 'dark' },
  { label: 'Vermelho', value: 'red' },
];

const LAB_CARGOES: LabCargo[] = [
  {
    id: 'tapajos-01-orange',
    title: 'Comboio Tapajós-01',
    route: 'Miritituba → Barcarena',
    dateTime: '18 Jun 14h30',
    tonnage: '32.400 t',
    cargoType: 'Soja a Granel',
    statusLabel: 'Em Trânsito',
    variant: 'orange',
  },
  {
    id: 'madeira-03-purple',
    title: 'Comboio Madeira-03',
    route: 'Porto Velho → Itacoatiara',
    dateTime: '19 Jun 09h10',
    tonnage: '28.900 t',
    cargoType: 'Milho a Granel',
    statusLabel: 'Aguardando',
    variant: 'purple',
  },
  {
    id: 'barcarena-02-cyan',
    title: 'Comboio Barcarena-02',
    route: 'Santarém → Vila do Conde',
    dateTime: '20 Jun 07h45',
    tonnage: '21.600 t',
    cargoType: 'Fertilizantes',
    statusLabel: 'Atracado',
    variant: 'cyan',
  },
  {
    id: 'solimoes-07-gray',
    title: 'Comboio Solimões-07',
    route: 'Manaus → Tabatinga',
    dateTime: '21 Jun 11h20',
    tonnage: '12.850 t',
    cargoType: 'Carga Geral',
    statusLabel: 'Planejado',
    variant: 'graySoft',
  },
  {
    id: 'tocantins-04-dark',
    title: 'Comboio Tocantins-04',
    route: 'Marabá → Barcarena',
    dateTime: '22 Jun 16h00',
    tonnage: '18.300 t',
    cargoType: 'Bauxita',
    statusLabel: 'Arquivado',
    variant: 'dark',
  },
  {
    id: 'amazonas-09-red',
    title: 'Comboio Amazonas-09',
    route: 'Itacoatiara → Macapá',
    dateTime: '23 Jun 06h25',
    tonnage: '35.100 t',
    cargoType: 'Contêineres',
    statusLabel: 'Alerta',
    variant: 'red',
  },
];

export function MinhasCargasGlassLab() {
  const [activeFilter, setActiveFilter] = useState<CargoFilter>('all');

  const visibleCargoes = useMemo(() => {
    if (activeFilter === 'all') {
      return LAB_CARGOES;
    }

    return LAB_CARGOES.filter((cargo) => cargo.variant === activeFilter);
  }, [activeFilter]);

  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true" />

      <section className={styles.contentShell} aria-labelledby="minhas-cargas-glass-title">
        <header className={styles.header}>
          <a className={styles.backLink} href="./embarcador-glass-flow">
            ‹ Fluxo embarcadora
          </a>
          <span className={styles.kicker}>HydriRivers Lab</span>
          <h1 id="minhas-cargas-glass-title">Minhas Cargas</h1>
          <p>Galeria isolada para validar cards Liquid Glass, variantes de status e filtros sem alterar o fluxo da persona.</p>
        </header>

        <div className={styles.summaryCard}>
          <span>Biblioteca visual</span>
          <strong>{visibleCargoes.length} cards</strong>
          <p>Variantes oficiais: laranja, roxo, ciano, cinza, grafite e vermelho.</p>
        </div>

        <nav className={styles.filters} aria-label="Filtrar cards por variante visual">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`${styles.filterChip} ${activeFilter === filter.value ? styles.filterChipActive : ''}`}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </nav>

        <div className={styles.cargoList}>
          {visibleCargoes.map((cargo) => (
            <CargoGlassCard
              key={cargo.id}
              title={cargo.title}
              route={cargo.route}
              dateTime={cargo.dateTime}
              tonnage={cargo.tonnage}
              cargoType={cargo.cargoType}
              statusLabel={cargo.statusLabel}
              variant={cargo.variant}
              onClick={() => undefined}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
