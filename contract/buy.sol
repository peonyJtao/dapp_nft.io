// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// 设计逻辑
// 卖家：出售NFT的一方，可以挂单list、撤单revoke、修改价格update。
// 买家：购买NFT的一方，可以购买purchase。
// 订单：卖家发布的NFT链上订单，一个系列的同一tokenId最多存在一个订单，其中包含挂单价格price和持有人owner信息。
// 当一个订单交易完成或被撤单后，其中信息清零。
import {IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTSwap is IERC721Receiver {
    struct Order {
        address owner; // 订单owner
        uint256 price; // 订单价格
        uint256 status; // 0 订单发布 1 交易成功 2 交易撤销
    }
    mapping(IERC721 => mapping(uint256 => Order)) public nftList;
    // 每个nft地址对应的的数量
    mapping(IERC721 => uint256) public nftCount;
    // 发布订单事件
    event List(
        address indexed seller,
        IERC721 indexed nftAddr,
        uint256 indexed tokenId,
        uint256 price
    );
    // 购买事件
    event Buy(
        address indexed buyer,
        IERC721 indexed nftAddr,
        uint256 indexed tokenId,
        uint256 price
    );
    // 撤销订单事件
    event Revoke(
        address indexed seller,
        IERC721 indexed nftAddr,
        uint256 indexed tokenId
    );
    // 更新价格事件
    event Update(
        address indexed seller,
        IERC721 indexed nftAddr,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    // nft拥有者 创建订单
    function create(
        IERC721 _nftAddr,
        uint256 _tokenId,
        uint256 _price
    ) external {
        // nft地址
        IERC721 _nft = _nftAddr;
        // 判断是否授权
        require(_nft.getApproved(_tokenId) == address(this), "Need Approval");
        require(_price > 0, "Price must > 0");
        Order storage _order = nftList[_nftAddr][_tokenId];
        _order.owner = msg.sender;
        _order.price = _price;
        // 将NFT转账到合约
        _nft.safeTransferFrom(msg.sender, address(this), _tokenId);
        nftCount[_nftAddr]++;
        emit List(msg.sender, _nftAddr, _tokenId, _price);
    }

    // 更新价格
    function updatePrice(
        IERC721 _nftAddr,
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(_price > 0, "Invalid Price");
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.owner == msg.sender); // owner 才能修改
        IERC721 _nft = _nftAddr;
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        _order.price = _price;
        emit Update(msg.sender, _nftAddr, _tokenId, _price);
    }

    // 撤销订单
    function revoke(IERC721 _nftAddr, uint256 _tokenId) external {
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.owner == msg.sender); // owner 才能修改
        IERC721 _nft = _nftAddr;
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        _nft.safeTransferFrom(address(this), msg.sender, _tokenId); // 将nft转回卖家
        _order.status = 2;
        emit Revoke(msg.sender, _nftAddr, _tokenId);
        delete nftList[_nftAddr][_tokenId];
    }

    // 购买
    function buy(IERC721 _nftAddr, uint256 _tokenId) external payable {
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.status == 0, "Invalid Order"); //订单是创建状态
        require(msg.value > _order.price, "Invalid Price"); // 出价大于价格
        IERC721 _nft = _nftAddr;
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        _order.status = 1; // 将订单状态改为完成状态
        _nft.safeTransferFrom(address(this), msg.sender, _tokenId); // nft转账给买家
        payable(_order.owner).transfer(_order.price); // eth转账给卖家
        // 如果出价大于nft价格，将溢出的价格转回给买家
        if (msg.value > _order.price) {
            payable(msg.sender).transfer(msg.value - _order.price);
        }
        emit Buy(msg.sender, _nftAddr, _tokenId, _order.price);
        delete nftList[_nftAddr][_tokenId];
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}