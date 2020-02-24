curl -L -o zome-template.tar.gz https://github.com/holochain/react-graphql-template/archive/hn-happ-add-zome.tar.gz
mkdir zome-template
tar -zxvf zome-template.tar.gz --strip-components=1 -C ./zome-template
rm zome-template.tar.gz
cd zome-template/dna_src
cp -R ./test/notes ./test/players
cp -R ./zomes/notes ./zomes/players
node replace.js
cd ../..
cp -R ./zome-template/dna_src/test/players ./dna_src/test/players
cp -R ./zome-template/dna_src/zomes/players ./dna_src/zomes/players
