import type { Knex } from 'knex';
import { db } from '../db';
import {
  PaginatedResult,
  Status,
  WebBanner,
  WebFooterGroup,
  WebFooterLink,
  WebMediaAsset,
  WebSection,
  WebSectionItem,
  WebSetting,
} from '../entities/web-control.entities';

type DbConnection = Knex | Knex.Transaction;
type ListFilters = { page?: number; limit?: number; status?: Status };

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

function page(filters: ListFilters) {
  return filters.page ?? 1;
}

function limit(filters: ListFilters) {
  return filters.limit ?? 20;
}

async function listRows<T>(
  table: string,
  filters: ListFilters = {},
  conn?: DbConnection,
  extra?: (query: Knex.QueryBuilder) => void,
  hasDisplayOrder = true,
): Promise<PaginatedResult<T>> {
  const base = connection(conn)(table);
  if (filters.status) base.where({ status: filters.status });
  if (extra) extra(base);

  const currentPage = page(filters);
  const currentLimit = limit(filters);
  const rowsQuery = base.clone().select('*');
  if (hasDisplayOrder) rowsQuery.orderBy('display_order', 'asc');
  rowsQuery.orderBy('created_at', 'desc').limit(currentLimit).offset((currentPage - 1) * currentLimit);

  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    rowsQuery,
  ]);

  return { items: items as T[], total: Number(count), page: currentPage, limit: currentLimit };
}

async function createRow<T>(table: string, input: Partial<T>, conn?: DbConnection): Promise<T> {
  const [row] = await connection(conn)(table).insert(input).returning('*');
  return row as T;
}

async function getRowById<T>(table: string, id: string, conn?: DbConnection): Promise<T | null> {
  const row = await connection(conn)(table).where({ id }).first();
  return (row as T | undefined) ?? null;
}

async function updateRow<T>(table: string, id: string, input: Partial<T>, conn?: DbConnection): Promise<T | null> {
  const [row] = await connection(conn)(table)
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as T | undefined) ?? null;
}

async function archiveRow<T>(table: string, id: string, conn?: DbConnection): Promise<T | null> {
  return updateRow<T>(table, id, { status: 'archived' } as unknown as Partial<T>, conn);
}

export async function createBanner(input: Partial<WebBanner>, conn?: DbConnection) {
  return createRow<WebBanner>('web_banners', input, conn);
}

export async function listBanners(filters: ListFilters = {}, conn?: DbConnection) {
  return listRows<WebBanner>('web_banners', filters, conn);
}

export async function getBannerById(id: string, conn?: DbConnection) {
  return getRowById<WebBanner>('web_banners', id, conn);
}

export async function updateBanner(id: string, input: Partial<WebBanner>, conn?: DbConnection) {
  return updateRow<WebBanner>('web_banners', id, input, conn);
}

export async function archiveBanner(id: string, conn?: DbConnection) {
  return archiveRow<WebBanner>('web_banners', id, conn);
}

export async function createSection(input: Partial<WebSection>, conn?: DbConnection) {
  return createRow<WebSection>('web_sections', input, conn);
}

export async function listSections(filters: ListFilters = {}, conn?: DbConnection) {
  return listRows<WebSection>('web_sections', filters, conn);
}

export async function getSectionById(id: string, conn?: DbConnection) {
  return getRowById<WebSection>('web_sections', id, conn);
}

export async function updateSection(id: string, input: Partial<WebSection>, conn?: DbConnection) {
  return updateRow<WebSection>('web_sections', id, input, conn);
}

export async function archiveSection(id: string, conn?: DbConnection) {
  return archiveRow<WebSection>('web_sections', id, conn);
}

export async function createSectionItem(input: Partial<WebSectionItem>, conn?: DbConnection) {
  return createRow<WebSectionItem>('web_section_items', input, conn);
}

export async function listSectionItems(
  filters: ListFilters & { section_id?: string } = {},
  conn?: DbConnection,
) {
  return listRows<WebSectionItem>('web_section_items', filters, conn, (query) => {
    if (filters.section_id) query.where({ section_id: filters.section_id });
  });
}

export async function getSectionItemById(id: string, conn?: DbConnection) {
  return getRowById<WebSectionItem>('web_section_items', id, conn);
}

export async function updateSectionItem(id: string, input: Partial<WebSectionItem>, conn?: DbConnection) {
  return updateRow<WebSectionItem>('web_section_items', id, input, conn);
}

export async function deleteSectionItem(id: string, conn?: DbConnection) {
  const deleted = await connection(conn)('web_section_items').where({ id }).delete();
  return deleted > 0;
}

export async function createFooterGroup(input: Partial<WebFooterGroup>, conn?: DbConnection) {
  return createRow<WebFooterGroup>('web_footer_groups', input, conn);
}

export async function listFooterGroups(filters: ListFilters = {}, conn?: DbConnection) {
  return listRows<WebFooterGroup>('web_footer_groups', filters, conn);
}

export async function getFooterGroupById(id: string, conn?: DbConnection) {
  return getRowById<WebFooterGroup>('web_footer_groups', id, conn);
}

export async function updateFooterGroup(id: string, input: Partial<WebFooterGroup>, conn?: DbConnection) {
  return updateRow<WebFooterGroup>('web_footer_groups', id, input, conn);
}

export async function archiveFooterGroup(id: string, conn?: DbConnection) {
  return archiveRow<WebFooterGroup>('web_footer_groups', id, conn);
}

export async function createFooterLink(input: Partial<WebFooterLink>, conn?: DbConnection) {
  return createRow<WebFooterLink>('web_footer_links', input, conn);
}

export async function listFooterLinks(filters: ListFilters & { group_id?: string } = {}, conn?: DbConnection) {
  return listRows<WebFooterLink>('web_footer_links', filters, conn, (query) => {
    if (filters.group_id) query.where({ group_id: filters.group_id });
  });
}

export async function getFooterLinkById(id: string, conn?: DbConnection) {
  return getRowById<WebFooterLink>('web_footer_links', id, conn);
}

export async function updateFooterLink(id: string, input: Partial<WebFooterLink>, conn?: DbConnection) {
  return updateRow<WebFooterLink>('web_footer_links', id, input, conn);
}

export async function archiveFooterLink(id: string, conn?: DbConnection) {
  return archiveRow<WebFooterLink>('web_footer_links', id, conn);
}

export async function upsertSetting(key: string, value: Record<string, unknown>, conn?: DbConnection) {
  const [row] = await connection(conn)('web_settings')
    .insert({ key, value, updated_at: new Date() })
    .onConflict('key')
    .merge({ value, updated_at: new Date() })
    .returning('*');
  return row as WebSetting;
}

export async function listSettings(conn?: DbConnection) {
  return (await connection(conn)('web_settings').select('*').orderBy('key', 'asc')) as WebSetting[];
}

export async function getSettingByKey(key: string, conn?: DbConnection) {
  const row = await connection(conn)('web_settings').where({ key }).first();
  return (row as WebSetting | undefined) ?? null;
}

export async function createMediaAsset(input: Partial<WebMediaAsset>, conn?: DbConnection) {
  return createRow<WebMediaAsset>('web_media_assets', input, conn);
}

export async function listMediaAssets(filters: ListFilters = {}, conn?: DbConnection) {
  return listRows<WebMediaAsset>('web_media_assets', filters, conn, undefined, false);
}

export async function getMediaAssetById(id: string, conn?: DbConnection) {
  return getRowById<WebMediaAsset>('web_media_assets', id, conn);
}

export async function archiveMediaAsset(id: string, conn?: DbConnection) {
  return archiveRow<WebMediaAsset>('web_media_assets', id, conn);
}
