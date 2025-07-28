document.addEventListener('DOMContentLoaded', function () {
  const jobSeriesOptions = [
    { value: '0018', label: 'Safety Officer (0018)' },
    { value: '0080', label: 'Security Administration (0080)' },
    { value: '0343', label: 'Management and Program Analyst (0343)' },
    { value: '2210', label: 'IT Specialist (2210)' },
    // Add more as needed
  ];

  const jobSeriesSelect = document.getElementById('jobSeries');
  jobSeriesOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    jobSeriesSelect.appendChild(option);
  });

  document.getElementById('pd-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const jobSeries = jobSeriesSelect.value;
    const component = document.getElementById('component').value;
    const historicalData = document.getElementById('historicalData').value;
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = "Generating...";

    try {
      const response = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobSeries, component, historicalData })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              resultDiv.textContent = fullText;
            }
          } catch (e) {
            console.warn('Could not parse line:', line);
          }
        }
      }

    } catch (error) {
      resultDiv.textContent = "Error: " + error.message;
    }
  });
});

