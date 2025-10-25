const BASE_URL = 'http://localhost:8080/api/usuarios';

export async function post(endpoint: string, data: any) {
    try {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        return res.headers.get('content-type')?.includes('application/json') ? await res.json() : await res.text();
    } catch (err) {
        throw err;
    }
}
