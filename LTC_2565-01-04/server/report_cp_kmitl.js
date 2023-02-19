// server\report_cp_kmitl.js
// Modified from server\new_cp_report.js
// To remove SERVICE_CENTER

import { Meteor } from 'meteor/meteor';
import '../imports/db.js';
import { ELDERLYREGISTER } from '../imports/db.js';
import { CAREPLAN_DETAIL } from '../imports/db.js';
import { EVALUATE_DISTRICT } from '../imports/db.js';
// import { SERVICE_CENTER } from '../imports/db.js';
import { healthCenters } from '../imports/db.js';

Meteor.startup(() => {
    Meteor.methods({
        findElderyRegister_kt(cpSelector) {
            // console.log(cpSelector);
            let tambonIdList = cpSelector.tambonList.map((ele) => ele.tambonID);
            let hcList = healthCenters.aggregate([
                {
                    $match: {
                        tambonID: { $in: tambonIdList },
                        hcType: { $nin: [16] },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        hcType: 1,
                        hcID: '$id5',
                        tambonID: 1,
                        zone: 1,
                        hcName: 1,
                    },
                },
                {
                    $sort: {
                        hcID: 1,
                    },
                },
            ]);
            let hcIDs = hcList.map((ele) => ele.hcID);
            let elders = ELDERLYREGISTER.aggregate([
                {
                    $project: {
                        HOSPCODE: '$HOSPCODE',
                        CID: '$CID',
                        NHSO: {
                            $cond: {
                                if: { $eq: ['$NHSO', true] },
                                then: 'true',
                                else: 'false',
                            },
                        },
                        MAINSCLCODE: {
                            $cond: {
                                if: { $eq: ['$MAINSCLCODE', 'WEL'] },
                                then: 'WEL',
                                else: 'ETC',
                            },
                        },
                        STATUS: '$STATUS',
                        PRENAME: {
                            $cond: {
                                if: {
                                    $or: [
                                        { $eq: ['$PRENAME', 'เด็กชาย'] },
                                        { $eq: ['$PRENAME', 'นาย'] },
                                    ],
                                },
                                then: 'ชาย',
                                else: 'หญิง',
                            },
                        },
                        BUDGETYEAR: {
                            $ifNull: [
                                '$BUDGETYEAR',
                                {
                                    $toString: {
                                        $add: [
                                            {
                                                $toInt: {
                                                    $dateToString: {
                                                        format: '%Y',
                                                        date: '$CREATEDATE',
                                                        timezone:
                                                            'Asia/Bangkok',
                                                    },
                                                },
                                            },
                                            543,
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
                {
                    $match: {
                        HOSPCODE: { $in: hcIDs },
                        NHSO: { $regex: cpSelector.db },
                        MAINSCLCODE: { $regex: cpSelector.permission },
                        STATUS: { $in: cpSelector.type },
                        BUDGETYEAR: { $regex: cpSelector.year },
                        PRENAME: { $regex: cpSelector.sex },
                    },
                },
            ]);
            // console.log(elders);
            hcList.forEach((item, index, self) => {
                hcList[index].ELDER = 0;
                for (i = 0; i < elders.length; i++) {
                    if (elders[i].HOSPCODE === item.hcID) {
                        hcList[index].ELDER++;
                    }
                }
            });
            let elderIDs = elders.map((ele) => ele.CID);
            let carePlans = CAREPLAN_DETAIL.aggregate([
                {
                    $match: {
                        HOSPCODE: { $in: hcIDs },
                        CID: { $in: elderIDs },
                    },
                },
                {
                    $group: {
                        _id: '$HOSPCODE',
                        count: { $sum: 1 },
                    },
                },
            ]);
            // console.log(carePlans);
            hcList.forEach((item, index, self) => {
                hcList[index].CAREPLAN = 0;
                for (i = 0; i < carePlans.length; i++) {
                    if (carePlans[i]._id === item.hcID) {
                        hcList[index].CAREPLAN += carePlans[i].count;
                    }
                }
            });
            hcList.forEach((item, index, self) => {
                hcList[index].NAME = `[${item.hcID}] ${item.hcName}`;
            });
            return hcList;
        },
    });
});
