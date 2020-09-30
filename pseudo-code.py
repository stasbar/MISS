candidating_claims  # { [content-hash] : [publisher_pubkey] : integer }
previous_block_hash


def process_new_block(block):
    # handle broken proof-of-time chains
    for content_hash in candidating_claims:
        for publisher_pubkey in candidating_claims[content_hash]:
            if (content_hash, publisher_pubkey) not in block.transactions:
                # proofs-of-time chain has been broken, store the length
                stored_claims[content_hash][publisher_pubkey] = \
                    candidating_claims[content_hash][publisher_pubkey]
                delete candidating_claims[content_hash][publisher_pubkey]

    for transaction in block.transactions:
        content_hash = transaction.hash
        publisher_publickey = transaction.publisher_publickey
        previous_block_hash = transaction.previous_block_hash
        # check the previous_block_hash to prevent pre-signed proofs
        if previous_block_hash != previous_block_hash:
            continue
        candidating_claims[content_hash][publisher_publickey] += 1

    previous_block_hash = block.hash


def get_credibility_score(content):
    if stored_claims[content] > candidating_claims[content]:
        return stored_claims[content]
    else:
        return candidating_claims[content]
