/* eslint-disable require-jsdoc */

'use strict';

QUnit.module("Тестируем функцию fetchAndMerge", function () {
    QUnit.test("Возвращает объект при полученных данных", async function (assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": "Дуров, верни стену!"
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
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Работает правильно при ошибках fetch", async function (assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой объект при ошибке fetch");
    });

    QUnit.test("Работает с пустым массивом URL", async (assert) => {
        const result = await fetchAndMergeData([]);
        assert.deepEqual(result, {}, "Пустой массив → пустой объект");
    });

    QUnit.test("Удаляет дублирующиеся значения", async (assert) => {
        window.fetch = (url) => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(
                url === 'a' ? { id: 1, city: 'Москва' } : { id: 1, city: 'Москва' }
            )
        });

        const result = await fetchAndMergeData(['a', 'b']);
        assert.deepEqual(result, { id: 1, city: 'Москва' }, "Дубликаты должны удаляться");
    });

    QUnit.test("Игнорирует undefined, но сохраняет null", async (assert) => {
        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ a: null, b: undefined, c: 42 })
        });

        const result = await fetchAndMergeData(['url']);
        assert.deepEqual(result, { a: null, c: 42 }, "null сохраняется, undefined игнорируется");
    });

    QUnit.test("Работает с одним URL", async (assert) => {
        window.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ x: 10, y: 20 })
        });

        const result = await fetchAndMergeData(['url']);
        assert.deepEqual(result, { x: 10, y: 20 }, "Один URL работает корректно");
    });

    QUnit.test("Частичная ошибка загрузки", async (assert) => {
        window.fetch = (url) => url === 'bad'
            ? Promise.reject()
            : Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });

        const result = await fetchAndMergeData(['bad', 'good']);
        assert.deepEqual(result, { id: 1 }, "Успешные URL обрабатываются даже при частичных ошибках");
    });
});