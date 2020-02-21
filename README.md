
curl -L -o master.tar.gz https://github.com/holochain/react-graphql-template/archive/master.tar.gz
mkdir happ-template
tar -zxvf master.tar.gz --strip-components=1 -C ./happ-template
