import chromadb
from sentence_transformers import SentenceTransformer

# create chromadb client
client = chromadb.Client()
collection = client.create_collection(name="compliance_docs")

# load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# sample documents
def load_documents():
    return [
        "Company must follow data protection laws.",
        "Employees should be trained in compliance policies.",
        "Regular audits are necessary for safety and legal compliance."
    ]

# split into chunks
def split_into_chunks(text, size=500, overlap=50):
    chunks = []
    for i in range(0, len(text), size - overlap):
        chunks.append(text[i:i+size])
    return chunks

# store data
def store_data():
    docs = load_documents()
    all_chunks = []

    for doc in docs:
        chunks = split_into_chunks(doc)
        all_chunks.extend(chunks)

    embeddings = model.encode(all_chunks)

    for i, chunk in enumerate(all_chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i]],
            ids=[str(i)]
        )

    print("Data stored successfully")

# run file
if __name__ == "__main__":
    store_data()