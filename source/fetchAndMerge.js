'use strict';

/**
 * Функция для загрузки и объединения данных с нескольких URL
 * @param {string[]} urls - Массив URL-адресов для загрузки
 * @returns {Promise<Object>} Объект с объединенными данными
 */

const fetchAndMergeData = async (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return {};

    const results = await Promise.all(
        urls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                return await response.json();
            } catch {
                return null;
            }
        })
    );

    const merged = {};

    results.forEach((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            Object.entries(data).forEach(([key, value]) => {
                if (value === undefined) return;
                if (!merged[key]) merged[key] = [];
                if (!merged[key].includes(value)) merged[key].push(value);
            });
        }
    });

    Object.keys(merged).forEach(key => {
        if (merged[key].length === 1) {
            merged[key] = merged[key][0];
        }
    });

    return merged;
};
