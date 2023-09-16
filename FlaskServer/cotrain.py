import cohere

co = cohere.Client("w3k6SMLDH0SFtVvCwshQoomZwONOsiM5iahj3ixY")

item = "2"

response = co.generate(
    prompt="given there are 4 total parking spots and 2 are used, are there any available parking spots?",
)
print(response.generations[0].text)
