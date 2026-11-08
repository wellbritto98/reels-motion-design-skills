import type React from 'react';
import * as L from './library';

/** Registro: o nome usado em `type:` no timeline → componente. Para criar um gráfico novo, exporte-o em library.tsx e adicione aqui. */
export const INSERTS = {
  TitleCard: L.TitleCard,
  RowsList: L.RowsList,
  BigStat: L.BigStat,
  Equation: L.Equation,
  Bars: L.Bars,
  LineChart: L.LineChart,
  PhotoCard: L.PhotoCard,
  Versus: L.Versus,
  Balance: L.Balance,
  DotsGrid: L.DotsGrid,
  Flow: L.Flow,
  Quote: L.Quote,
} as const satisfies Record<string, React.FC<any>>;

export type InsertType = keyof typeof INSERTS;
