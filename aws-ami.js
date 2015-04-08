var child_process = require('child_process');
var amiNATName="amzn-ami-vpc-nat-hvm-2015.03.0.x86_64-gp2"
var amiAMZN64HVM="amzn-ami-hvm-2015.03.0.x86_64-gp2"

if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        return !!~this.indexOf(arg);
    };
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function getRegions() {
  var cmd = "aws ec2 describe-regions"
  regions = child_process.execSync(cmd, { encoding: 'utf8' });
  regions = JSON.parse(regions);
  return regions;
}

function getAMIbyName(name,region) {
  var cmd = "aws ec2 describe-images --filters \"Name=name,Values=AMI-PLACEHOLDER\" --region REGION-PLACEHOLDER";
  cmd = replaceAll(cmd,"AMI-PLACEHOLDER",name);
  cmd = replaceAll(cmd,"REGION-PLACEHOLDER",region);

  var ami = child_process.execSync(cmd, { encoding: 'utf8' });

  return JSON.parse(ami);

}


function printNATAMI() {
  var amis = {};
  amis["AWSNATAMI"] = {};
  var regions = getRegions();
  for (v in regions.Regions) {
    var _region = (regions.Regions[v].RegionName);
    var ami = getAMIbyName(amiNATName,_region);

    amis.AWSNATAMI[_region] = {};
    //pick the first one if many
    amis.AWSNATAMI[_region]["AMI"] = ami.Images[0].ImageId;
  }

  console.log(JSON.stringify(amis, null, 4));
}

function printAMZNAMI() {
  var amis = {};
  amis["AMI"] = {};
  var regions = getRegions();
  for (v in regions.Regions) {
    var _region = (regions.Regions[v].RegionName);
    var ami = getAMIbyName(amiAMZN64HVM,_region);

    amis.AMI[_region] = {};
    //pick the first one if many
    amis.AMI[_region]["64HVM"] = ami.Images[0].ImageId;
  }

  console.log(JSON.stringify(amis, null, 4));
}


console.log("64-bit NAT HVM AMI:");
printNATAMI();
console.log("64-bit Amazon HVM AMI:");
printAMZNAMI();
