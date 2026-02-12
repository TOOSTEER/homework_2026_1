'use strict';

/**
 * Загружает JSON с нескольких URL и объединяет в один объект.
 * Повторяющиеся ключи объединяются в массивы уникальных значений.
 * @param {string[]} urls - Массив URL для загрузки
 * @returns {Promise<Object>} Объект с объединёнными данными
 */
const fetchAndMergeData = async (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return {};

    try {
        const results = await Promise.all(
            urls.map(async (url) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return null;
                    return await res.json();
                } catch {
                    return null;
                }
            })
        );

        const merged = {};

        results.forEach((data) => {
            if (!data || typeof data !== 'object' || Array.isArray(data)) return;

            Object.entries(data).forEach(([key, value]) => {
                if (value == null) return;

                if (!merged[key]) merged[key] = [];
                if (!merged[key].includes(value)) merged[key].push(value);
            });
        });

        return merged;
    } catch {
        return {};
    }
};