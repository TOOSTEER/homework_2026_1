

'use strict';

QUnit.module("Testing fetchAndMerge function", function () {
    QUnit.test("Returns merged object from multiple URLs", async function (assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };

        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Олег", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "should correctly merge data from different URLs");
    });

    QUnit.test("Handles fetch errors gracefully", async function (assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "should return empty object on fetch error");
    });


    QUnit.test('Empty URL array', async (assert) => {
        const result = await fetchAndMergeData([]);
        assert.deepEqual(result, {}, 'empty array → empty object');
    });

    QUnit.test('Removes duplicate values', async (assert) => {
        window.fetch = (url) => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(
                url === 'a' ? { id: 1, city: 'Msk' } : { id: 1, city: 'Msk' }
            )
        });

        const result = await fetchAndMergeData(['a', 'b']);
        assert.deepEqual(result, { id: [1], city: ['Msk'] }, 'duplicates removed');
    });

    QUnit.test('Ignores null and undefined', async (assert) => {
        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ a: null, b: undefined, c: 42 })
        });

        const result = await fetchAndMergeData(['url']);
        assert.deepEqual(result, { c: [42] }, 'null/undefined ignored');
    });

    QUnit.test('Single URL', async (assert) => {
        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ x: 10, y: 20 })
        });

        const result = await fetchAndMergeData(['url']);
        assert.deepEqual(result, { x: [10], y: [20] }, 'works with one URL');
    });

    QUnit.test('Partial fetch failure', async (assert) => {
        window.fetch = (url) => url === 'bad'
            ? Promise.reject()
            : Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });

        const result = await fetchAndMergeData(['bad', 'good']);
        assert.deepEqual(result, { id: [1] }, 'successful URL still processed');
    });
});