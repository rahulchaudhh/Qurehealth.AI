async function testRegister() {
    try {
        const res = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'password123'
            })
        });

        console.log('Response status:', res.status);
        const text = await res.text();
        console.log('Response body:', text);

        try {
            const data = JSON.parse(text);
            if (res.status === 201 && data.token) {
                console.log("SUCCESS: Registration successful.");
            } else if (res.status === 400 && data.error === 'Patient already exists') {
                console.log("SUCCESS: Registration endpoint hit (Patient exists).");
            }
        } catch (e) {
            console.log("Response was not JSON");
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testRegister();
